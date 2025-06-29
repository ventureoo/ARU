.. ARU (c) 2018 - 2025, Pavel Priluckiy, Vasiliy Stelmachenok and contributors

   ARU is licensed under a
   Creative Commons Attribution-ShareAlike 4.0 International License.

   You should have received a copy of the license along with this
   work. If not, see <https://creativecommons.org/licenses/by-sa/4.0/>.

.. _software:

*********
Выбор ПО
*********

Говоря об оптимизации системы невозможно не затронуть такую тему, как
выбор используемых программ. Несмотря на то, что это относится к
субъективным предпочтениям каждого пользователя, это оказывает прямое
влияние на производительность системы, так как все программы
отличаются друг от друга такими объективными показателями как
потребление памяти, использование процессора, диска и других ресурсов
системы. Иными словами, от того насколько оптимизированы ваши
программы зависит общая производительность всей системы, поэтому в
данном разделе автор предложит ряд рекомендаций о том, какое ПО
следует выбрать для тех или иных задач с учётом их нетребовательности
к ресурсам вашего ПК.

.. index:: installation, packages, basic, grub
.. _mandatory-packages:

================================
Обязательные к установке пакеты
================================

Эта группа пакетов **обязательна** к установке. Она содержит ряд
полезных инструментов без которых вы не сможете установить множество
пакетов из AUR, включая все те, о которых пойдет речь далее в
руководстве. И так как в начале руководства мы условились пользоваться
"дедовским" методом установки AUR пакетов, дополнительно установим
``git`` для скачивания PKGBUILD. Далее в руководстве часто будет
требоваться редактировать те или иные конфигурационные файлы, поэтому
вам необходимо установить любой текстовый редактор на ваш вкус и
запускать его в терминале с правами root (то есть при помощи команды
``sudo``), когда будет идти речь о редактировании системных файлов.
Если вы не знаете какой текстовый редактор лучше установить, то
универсальным решением является консольный редактор ``nano``::

 sudo pacman -S base-devel git nano

.. index:: wayland, x11, comprasion
.. _wayland_vs_x11:

===================
Wayland vs X11
===================

Часто задаваемый вопрос, это на базе какого графического протокола
следует выбирать рабочее окружение - Wayland или X11? Обычно можно
услышать лишь различные субъективные оценки и мнения, но автор
попытается провести объективное их сравнение, после чего читатель
сможет сам решить, что лучше выбрать.

Прежде всего следует понимать, что так называемый графический протокол
X11 берёт свое начало 40 лет назад, в эпоху когда не существовало
современных GPU и мультимониторных конфигураций. Конечно, протокол за
всё это время получал достаточно много обновлений в рамках развития к
нашему времени уже единственной (кроме Xwayland) реализации - Xorg
сервера, в частности добавлялись новые расширения, которые в том числе
таки позволили работать с несколькими мониторами (расширение xinerama и
xrandr) и улучшить производительность (частичные обновления экрана,
расширение X Damage). Однако фундаментальные ограничения самого
протокола из-за требований к сохранению обратной совместимости не
позволяют говорить о полном решении данных проблем.

Так как само понятие монитора в X11 как самодостаточной единицы
отсутствует, то до сих пор вывод со всех дисплеев объединяется в некий
единый логический "экран" (Screen), и все обновления содержимого окон
воспроизводится только с учётом обновления всего такого экрана, то
есть фактически в X11 нельзя обновить содержимое одного монитора
отдельно от содержимого другого, что порождает проблему разницы
частоты обновления. Если один монитор настроен на обновление с
частотой меньшей, чем у другого, то так как в парадигме протокола
обновляться может сразу только весь абстрактный экран, второй монитор
так же вынужден перерисовывать свое содержимое с частотой первого. У
этой проблемы есть решения, такие как выполнение обновления
логического экрана с самой большой частотой из доступных у всех
мониторов, но она не является единственной. Ещё одно вытекающее
следствие из этого - невозможность правильного осуществления
масштабирования выводимого изображения на экран, да и в целом
невозможность правильной его обработки с учетом особенностей каждого
отдельно взятого монитора, сюда же относится поддержка VRR и HDR.

Другая проблема протокола X11 состоит в ограниченности способов
отрисовки содержимого на этот самый экран. Приложение не может
рисовать содержимое своего окна самостоятельно, оно обязательно должно
делать это опосредованно и в соответствии с форматом необходимым для
использования API библиотеки libx11 или libxcb, которые изначально
были разработаны без учёта многих цветовых форматов и необходимости в
3D-ускорении средствами GPU. Другими словами, исторически у приложений
не было возможности выполнять прямую отрисовку содержимого окна через
подсистему DRM в ядре, все изменения и обновления могли быть совершены
только путем общения с X сервером с принудительными преобразованиями
на уровне приложения всех операций в двумерное пространство, что стало
большой проблемой, которая делала невозможной правильную отрисовку 3D
графики или делала её очень низкопроизводительной. Впоследствии эта
проблема была решена введением так называемого DRI - инфаструктуры
прямого рендеринга, однако решение это по сути прикручено сбоку от
самого графического протокола, то есть не является его расширением, а
просто попыткой обойти указанные ограничения в рамках графического
стэка развиваемого Mesa.

Ещё одна проблема протокола X11 - безопасность. Любое приложение может
знать о содержимом не только своего окна, но и других окон, а также
перехватывать по сути все события ввода, которые даже не были
адресованы конкретно данному окну. Таким образом для написания любого
зловредного ПО даже не нужно искать никакие уязвимости, протокол X11
сам вполне спокойно позволяет беспрепятственно получать любую
информацию. Отчасти этому способствует также "сетевая" архитектура
протокола. Написание простейшего "кейлоггера" для X11 может занимать
около 150 строк кода и не требует вообще никаких особых прав доступа.
Если вы думаете, что и на это появилось какое-то решение, то, увы нет.
Так называемое расширение безопасности X11 не получило широкого и
повсеместного распространения, многие приложения не работают правильно
с его использованием, так как изначально подразумевают себя
привилегированными для осуществления многих операций, что в итоге
приводит к их неработоспособности. Наиболее рабочими можно считать
только решения с запуском приложений в отдельном, изолированном X
сервере, что конечно нельзя назвать хорошим компромиссом.

С учётом всех вышеуказанных фундаментальных проблем протокола X11,
было решено развивать новый графический протокол - Wayland, который
призван был решить проблемы предшественника, и надо сказать вполне успешно.
Во-первых, в Wayland введено понятие "поверхностей" (``wl_surface``) -
не следует приравнивать поверхность к понятию окна, поверхность
представляет собой по сути "холст", в который приложение может
выполнять отрисовку по сути абсолютно любыми средствами, включая
различные API, такие как OpenGL, Vulkan и другие. Здесь нет никаких
ограничений, главное, чтобы в конечном счете появился ассоциированный
с поверхностью буфер, в котором находился набор пикселей определенного
цветого формата, которые затем будут отображены композитором.

Во-вторых, отображение поверхностей осуществляется через так
называемые ``wl_output`` объекты, которые описывают некоторую область
для вывода пикселей соответствующих поверхностей на экран, как правило
все такие объекты напрямую связаны с конкретным монитором у вас в
системе, и при этом управление над такими объектами осуществляется
полностью независимо, то есть без оглядки на другие такие объекты.

Наконец, в третьих, приложения ничего не могут знать о содержимом
других окон (поверхностей), кроме тех, которые управляются
непосредственно ими же, они также ничего не знают о событиях ввода,
которые адресованы не для них. Такие жесткие рамки хоть и создают
определенные сложности для разработчиков приложений, так как теперь
для взаимодействия с другими окнами приходится использовать средства
IPC, но это позволяет гарантировать безопасность.

Несмотря на все очевидные преимущества Wayland и работе над ошибками
X11, из-за сравнительно небольшого возраста он страдает от проблем с
"организационной" фрагментацией. У протокола нет единой рабочей
реализации (хотя есть эталонная - Weston), так как в его парадигме
любой Wayland композитор представляет собой по сути одновременно
графический сервер, оконный менеджер и композитор в узком смысле, для
объединения содержимого всех поверхностей в единое изображение на
вашем мониторе с возможным добавлением вертикальной синхронизации и
некоторых эффектов, таких как тени, прозрачность и т. д. Учитывая
столь широкие полномочия, которые в рамках X11 как правило
реализовывались отдельными сущностями, вполне логично, что большинство
рабочих окружений имеют свои собственные Wayland композиторы, которые
отвечают их собственным убеждениям о том, как должна выглядить
организация управления окнами в их окружении. На текущий момент можно
выделить четыре большие группы всех Wayland композиторов:

- mutter - композитор используемый в GNOME, применяется также в Budgie.
- KWin - композитор используемый в KDE Plasma.
- Композиторы на базе библиотеки wlroots (sway, river, labwc и другие).
- Композиторы на базе библиотеки smithray (Niri, COSMIC).

Кроме отличий в организации окнами, Wayland композиторы также
отличаются составом поддерживаемых расширений протокола Wayland,
которые тоже называются протоколами. Данные различия вносят небольшую
неразбериху в возможностях окружений на базе Wayland при их сравнении
с графическими сессиями на базе X11, так как часть дополнительных
протоколов могут быть реализованы в одном композиторе, но не в другом,
а кроме того любой композитор также может иметь свой собственный набор
протоколов, расширяющий его возможности. В контексте данного
руководство отдельно хотелось бы остановиться на данных дополнительных
протоколах Wayland:

- ``tearing-control`` - позволяет композиторам контролировать, для
  каких окон разрешено прямое асинхронное отображение кадров, что
  сопряжено с появлением так называемого "тиринга", то есть
  визуального разрыва между кадрами. Данный протокол полезен в первую
  очередь для полноэкранных видеоигр, предотвращая высокие задержки
  ввода вызванные синхронизацией кадров на стороне композитора (хочу
  отметить, что это не обязательно должна быть именно вертикальная
  синхронизация, но и в целом любая их обработка вроде простейших FIFO
  очередей). На текущий момент реализован во всех композиторах, кроме
  GNOME и композиторах на базе библиотеки Smithray.

- ``presentation-time`` - протокол, позволяющий приложениям,
  использующим Wayland, указывать определенную временную "подсказку"
  для отображения кадров с привязкой к некоторому событию или
  временному интервалу. Используется в основном в видеоплеерах для
  синхронизации потоков видео с аудиодорожкой. Поддерживается во всех
  мейнстримных композиторах Wayland. Рекомендуется использовать
  видеоплееры, которые полагаются на использование данного протокола.

- ``fifo`` - очень молодой протокол, который позволяет приложениям,
  использующим простую FIFO очередь для рендеринга кадров, говорить
  композитору о том, чтобы их отображение выполнялось сразу же с
  привязкой к частоте обновления монитора, а не через ожидание
  некоторого обратного вызова со стороны самого приложения. Реализован
  в GNOME (48+) и KDE Plasma (6.4+) и является является жёстким
  требованием для правильной работы нативных игр, использующих
  библиотеку SDL3.

Использование Wayland композиторов, которые реализуют все или хотя бы
часть из указанных протоколов, желательно в случае если вы активно
играете в игры и задержка ввода для вас не пустой звук. В остальном же
выбор композитора является субъективным делом.

Надеюсь, что эта небольшая (а может и большая?) заметка помогла вам
определиться в вопросе, который будоражит тысячи пользователей
различных форумов по Linux. Так или иначе, но вектор развития
большинства рабочих окружений сейчас направлен в сторону Wayland, а
сервер Xorg хоть и по прежнему остается рабочей лошадкой, постепенно
отходит на второй план и находится в состоянии полуактивного
сопровождения.

.. index:: installation, packages, archives
.. _archive-packages:

-----------------------------
Пакеты для работы с архивами
-----------------------------

В Linux есть поддержка целого зоопарка различных архивов и алгоритмов
их сжатия, но чтобы все они работали правильно, необходима установка
дополнительных пакетов::

  # zip, rar, ace, rzip/lcma/lzo, iso
  sudo pacman -S lrzip unrar unzip unace p7zip squashfs-tools

Но они предоставляют только интерфейс командной строки для работы с
архивами, потому стоит так же поставить графическую обертку с
минимальным набором зависимостей::

  sudo pacman -S file-roller

.. index:: installation, packages, applications
.. _applications-packages:

---------------------
Набор прикладного ПО
---------------------

Далее мы установим набор джентельмена в виде браузера (chromium),
плеера (VLC) и торрент-клиента (qbittorrent)::

  sudo pacman -S qbittorrent chromium vlc

Банально, но всё же.

Вдобавок можно отметить легковесный файловый менеджер PCManFM::

  sudo pacman -S pcmanfm-gtk3 gvfs gvfs-mtp

.. warning:: Пакеты начинающиеся с ``gvfs`` нужны для автомонтирования
   различных устройств (например Android смартфонов) и интеграции с
   различными сетевыми хранилищами (Google Disk/SAMBA и т.д.)

Итак, мы установили набор джентльмена и парочку программ, что
понадобятся нам в дальнейшем. Но если вас не устраивает тот или иной
компонент, вы всегда можете найти любой нужный вам пакет по адресу
https://www.archlinux.org/packages/. Если вы не смогли найти нужную
вам программу в официальных репозиториях, вы всегда можете найти всё
что душе угодно в AUR (по адресу https://aur.archlinux.org/packages/).


.. index:: installation, packages, steam
.. _steam-installation:

----------------
Установка Steam
----------------

Если в предыдущем разделе вы включили в конфигурации pacman
использование multilib репозитория, то из него можно установить
официальный клиент Steam. Существует две версии пакета, но автор
рекомендует использовать обычный пакет `steam`_ для лучшей
совместимости::

  sudo pacman -S steam ttf-liberation

Обратите внимание, что во время установки пакета pacman скорее всего
предложит вам выбрать желаемую 32-битную реализацию Vulkan драйвера. В
этом случае пользователям Nvidia следует выбрать пакет
``lib32-nvidia-utils``, а пользователям AMD и Intel - пакеты
``lib32-vulkan-radeon`` и ``lib32-vulkan-intel`` соответственно.

.. _steam: https://archlinux.org/packages/multilib/x86_64/steam/

.. index:: useful-programs, mouse, settings
.. _paper:

------
Piper
------

Позволяет выполнить более тонкую настройку вашей мышки, в том числе
переназначить DPI, настроить подсветку и собственные действия на
дополнительные кнопки.

.. image:: https://raw.githubusercontent.com/libratbag/piper/wiki/screenshots/piper-resolutionpage.png

**Установка** ::

  sudo pacman -S piper

.. attention:: Поддерживаются только некоторые из моделей мышек от
   Logitech/Razer/Steelseries. Полный список поддерживаемых устройств
   вы можете найти по ссылке:

   https://github.com/libratbag/libratbag/wiki/Devices
.. index:: installation, drivers, nvidia, amd, intel
.. _drivers-installation:

------------------------------------------------
Установка актуальных драйверов для видеокарты
------------------------------------------------

В установке драйверов для Linux-систем нет ничего сложного, главное
просто учитывать, что от свежести ядра и версии драйвера, будет
зависеть получите ли вы чёрный экран смерти или нет (Шутка).

И да, **устанавливайте драйвера ТОЛЬКО через пакетный менеджер вашего
дистрибутива!**

Забудьте про скачивание драйвера с сайта NVIDIA/AMD, это поможет вам
избежать кучу проблем в дальнейшем.

NVIDIA
------

Рекомендуется использовать модули драйвера из пакета ``nvidia-dkms``,
которые при помощи системы динамических модулей DKMS автоматически
собируться под нужное ядро::

  sudo pacman -S nvidia-dkms nvidia-utils lib32-nvidia-utils nvidia-settings lib32-opencl-nvidia opencl-nvidia libxnvctrl vulkan-icd-loader lib32-vulkan-icd-loader libva-nvidia-driver

.. warning:: Для правильной работы DKMS требуется также установить
   заголовки текущей версии ядра. Например, для стандартного ядра
   ``linux`` заголовки требуемые для сборки модулей находится внутри
   пакета ``linux-headers``.

С недавних пор помимо закрытых модулей драйвера NVIDIA также
предоставляет версию модулей с открытым исходным кодом, которые
необходимы для использования на поколениях Blackwell (50xx), но NVIDIA
также рекомендует использовать их на всех GPU начиная с поколения
Turing (16xx/20xx). Их установка практически ничем не отличается от
закрытого варианта кроме как заменой пакета ``nvidia-dkms`` на
``nvidia-open-dkms``::

  sudo pacman -S nvidia-open-dkms nvidia-utils lib32-nvidia-utils nvidia-settings lib32-opencl-nvidia opencl-nvidia libxnvctrl lib32-vulkan-icd-loader libva-nvidia-driver

Перед установкой драйвера рекомендуется отключить *"Secure Boot"* в
UEFI, ибо из-за этого модули драйвера могут не загрузиться.


NVIDIA (470xx)
---------------

Драйвер NVIDIA для Linux имеет несколько веток с долгосрочной поддержкой, часть
из которых, как например nvidia-470xx-dkms, оставлены для сохранения
совместимости со старыми видеокартами, в данном случае с поколением GPU Kepler.
Если ваша видеокарта относится именно к этому поколению, то вам нужно
установить не последний драйвер выше, а данную версию из AUR::

  git clone https://aur.archlinux.org/nvidia-470xx-utils
  cd nvidia-470xx-utils
  makepkg -sric

  sudo pacman -S lib32-vulkan-icd-loader

  # 32-битные библиотеки (необходимо для запуска игр через Wine/Steam)
  git clone https://aur.archlinux.org/lib32-nvidia-470xx-utils
  cd lib32-nvidia-470xx-utils
  makepkg -sric



Nouveau (*Только для старых видеокарт*)
------------------------------------------

Для старых видеокарт Nvidia (ниже GeForce 600) рекомендуется использовать
свободную альтернативу драйвера NVIDIA — Nouveau, входящую в состав Mesa. Она
имеет официальную поддержку и обновления в отличии от старых версий закрытого
драйвера NVIDIA (340, 390) и отлично справляется с 2D ускорением. Вдобавок,
Nouveau хорошо работает с Wayland::

  sudo pacman -S {lib32-,}mesa {lib32-,}vulkan-nouveau {lib32-,}opencl-mesa

AMD
----
::

  sudo pacman -S {lib32-,}mesa {lib32-,}vulkan-radeon vulkan-mesa-layers {lib32-,}opencl-mesa

Intel
-----
::

  sudo pacman -S {lib32-,}mesa {lib32-,}vulkan-intel {lib32-,}opencl-mesa

.. warning:: Автор не рекомендует выполнять установку морально
   устаревших DDX драйверов, как например ``xf86-video-intel``, так
   как они в большинстве своем заброшены и не получают никаких
   исправлений.  Вместо этого используйте DDX драйвер ``modesetting``,
   который поставляется вместе с пакетом ``xorg-server``. Он
   использует аппартное ускорение на базе glamor и Mesa. Обратите
   внимание, что последние исправления и новые возможности (Как,
   например, опция ``"Tearfree"``) доступны только в Git версии,
   поэтому имеет смысл установить ``xorg-server-git`` из AUR.

.. index:: cleanup, gnome, kde
.. _remove-garbage-packages:

==========================
Удаление лишних пакетов
==========================

К сожалению, если во время установки системы вы выполняли установку
KDE Plasma или GNOME при помощи одноименных групп пакетов, то скорее
всего вы установили себе в систему некоторое количество лишних
пакетов, таких как например ``gnome-software`` или ``discover``,
которые крайне не рекомендуется использовать в Arch Linux взамен
простого использования ``pacman``. Чтобы не выполнять переустановку
всех пакетов, связанных с рабочим окружением, можно выполнить удаление
лишних пакетов при помощи следующих команд в зависимости от
используемого окружения:

.. tab-set::

   .. tab-item:: GNOME

      ::

         sudo pacman -D --asdeps $(pacman -Qqg gnome)
         sudo pacman -D --asexplicit gnome-shell mutter gdm gnome-control-center gnome-console nautilus gnome-session gnome-settings-daemon gvfs gvfs-mtp
         sudo pacman -Rsn $(pacman -Qqgdtt gnome)

   .. tab-item:: KDE Plasma

      ::

         sudo pacman -D --asdeps $(pacman -Qqg plasma)
         sudo pacman -D --asexplicit plasma-desktop breeze-gtk kde-gtk-config plasma-pa bluedevil sddm sddm-kcm plasma-nm
         sudo pacman -Rsn $(pacman -Qqgdtt plasma)

Если вас пугает большой набор непонятных команд - не переживайте, все
что здесь происходит, это помечание всех пакетов из группы пакетов
``gnome`` или ``plasma`` соответственно как неявно установленных, то
есть подтянутых в качестве зависимостей, после чего идет изменение
причины установки базовых пакетов окружения уже как явно
установленных, что позволяет разделить действительно нужные и мусорные
пакеты по причине их установки и удалить все лишние пакеты. Конечно,
всегда думайте головой и проверяйте не подтянулось ли что-то для вас
нужное, однако данный способ гарантирует, что базовые пакеты,
необходимые для работы окружения, не будут удалены, поэтому вы всегда
сможете доустановить нужные вам программы в соответствии со своими
предпочтениями.

Если вы не используйте GNOME или KDE Plasma, то вы можете пропустить
данный шаг, так как для всех остальных рабочих окружений, таких как
Xfce, MATE и LXQt, в соответствующей им группе пакетов есть лишь
предельный минимум того, что действительно нужно.

.. index:: cpu, intel, amd, microcode
.. _microcode-installation:

======================
Установка микрокода
======================

Микрокод - программа реализующая набор инструкций процессора. Она уже встроена
в материнскую плату вашего компьютера, но скорее всего вы её либо не обновляли
вовсе, либо делаете это не часто вместе с обновлением BIOS (UEFI).

Однако у ядра Linux есть возможность применять обновления микрокода
прямо во время загрузки системы. Они содержат множественные
исправления ошибок и улучшения стабильности, поэтому настоятельно
рекомендуется их периодически устанавливать.

Осуществляется это следующими командами в зависимости от используемого
процессора:

.. tab-set::

   .. tab-item:: Intel

      ::

         sudo pacman -S intel-ucode
         sudo mkinitcpio -P

   .. tab-item:: AMD

      ::

         sudo pacman -S amd-ucode
         sudo mkinitcpio -P

.. index:: firmware, linux, installation
.. _missing_firmwares:

==================================
Установка дополнительных прошивок
==================================

В Arch Linux и основанных на нем дистрибутивах большинство прошивок
устройств как правило поставляются с пакетом linux-firmware и всех
связанных с ним пакетов (linux-firmware-whence, linux-firmware-bnx2x,
linux-firmware-liquidio, linux-firmware-marvell,
linux-firmware-mellanox, linux-firmware-nfp, linux-firmware-qcom,
linux-firmware-qlogic). Тем не менее вы можете столкнуться с
предупреждением во время пересборки initramfs образов через команду
``sudo mkinitcpio -P`` подобного формата::

  ==> WARNING: Possibly missing firmware for module: XXXXXXXX

Такие предупреждения не являются критическими, однако некоторые
устройства у вас в системе могут работать не полностью или вообще не
работать без требуемых прошивок. Поэтому в первую очередь
рекомендуется попробовать установить все вышеуказанные пакеты
linux-firmware (некоторые из них можно пропустить в силу отсутствия
соответствующих устройств, например linux-firmware-marvell).

Но некоторых прошивок нет в официальных репозиториях дистрибутива,
поэтому их требуется установить отдельно из AUR_ (все пакеты
содержащие файлы прошивок имеют окончание "-firmware"). Рассмотрим на
примере прошивки для модуля aic94xx::

  git clone https://aur.archlinux.org/aic94xx-firmware
  cd aic94xx-firmware
  makepkg -sric

После этого повторите команду ``sudo mkinitcpio -P``. Предупреждение о
пропуске прошивок для модуля aic94xx должно пропасть.

.. _AUR: https://aur.archlinux.org/packages?O=0&SeB=nd&K=-firmware&outdated=&SB=p&SO=d&PP=50&submit=Go

.. vim:set textwidth=70:
