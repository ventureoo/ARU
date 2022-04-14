.. ARU (c) 2018 - 2022, Pavel Priluckiy, Vasiliy Stelmachenok and contributors

   ARU is licensed under a
   Creative Commons Attribution-ShareAlike 4.0 International License.

   You should have received a copy of the license along with this
   work. If not, see <https://creativecommons.org/licenses/by-sa/4.0/>.

.. _generic-system-acceleration:

***************************
Базовое ускорение системы
***************************

Переходя к базовой оптимизации системы мне сто́ит напомнить, что чистый Arch Linux - это фундамент, и требуется уйма надстроек для нормальной работы системы.
Установить компоненты, которые будут отвечать за электропитание, чистку, оптимизацию и тому подобные вещи, что и описывается в данном разделе.

.. index:: makepkg-conf, native-compilation, flags, lto
.. _makepkg-conf:

======================
Настройка makepkg.conf
======================

Прежде чем приступать к сборке пакетов, мы должны изменить так называемые флаги компиляции,
что являются указателями для компилятора, какие инструкции и оптимизации использовать при сборке программ.

``sudo nano /etc/makepkg.conf`` # Редактируем (Где "-O2" - **Это не нуль/ноль**)

**Изменить ваши значения на данные:** ::

  CFLAGS="-march=native -mtune=native -O2 -pipe -fno-plt -fexceptions \
        -Wp,-D_FORTIFY_SOURCE=2 -Wformat -Werror=format-security \
        -fstack-clash-protection -fcf-protection"
  CXXFLAGS="$CFLAGS -Wp,-D_GLIBCXX_ASSERTIONS"
  RUSTFLAGS="-C opt-level=3"
  MAKEFLAGS="-j$(nproc) -l$(nproc)"
  OPTIONS=(strip docs !libtool !staticlibs emptydirs zipman purge !debug lto)

Данные флаги компилятора выжимают максимум производительности при компиляции, но могут вызывать ошибки сборки в очень редких приложениях.
Если такое случится, то отключите параметр ‘lto’ в строке options добавив перед ним символ восклицательного знака  ! (*"!lto"*).

.. index:: makepkg, clang, native-compilation, flags
.. _force-clang-usage:

------------------------------------------------------
Форсирование использования Clang при сборке пакетов
------------------------------------------------------

В системах на базе ядра Linux различают две основных группы компиляторов, это LLVM и GCC.
И те, и другие хорошо справляются с возложенными на них задачами,
но LLVM имеет чуть большее преимущество с точки зрения производительности при меньших потерях в качестве конечного кода.
Поэтому, в целом, применение компиляторов LLVM для сборки различных пакетов при задании флага -O2
(максимальная производительность) является совершенно оправданным, и может дать реальный прирост при работе программ.

Компилятором для языков C/C++ в составе LLVM является Clang и Clang++ соответственно.
Его использование при сборке пакетов мы и будем форсировать через makepkg.conf

Для начала выполним их установку::

  sudo pacman -Syu llvm clang lld

Теперь клонируем уже готовый конфигурационный файл /etc/makepkg.conf под новыми именем /etc/makepkg-clang.conf::

  sudo cp -r /etc/makepkg.conf /etc/makepkg-clang.conf

Это поможет нам в случае чего откатиться к использованию компиляторов GCC если возникнут проблемы со сборкой пакетов через LLVM/Clang.

Теперь откроем выше скопированный файл и добавим туда после строки ``CHOST="x86_64-pc-linux-gnu"`` следующее::

  export CC=clang
  export CXX=clang++
  export LD=ld.lld
  export CC_LD=lld
  export CXX_LD=lld
  export AR=llvm-ar
  export NM=llvm-nm
  export STRIP=llvm-strip
  export OBJCOPY=llvm-objcopy
  export OBJDUMP=llvm-objdump
  export READELF=llvm-readelf
  export RANLIB=llvm-ranlib
  export HOSTCC=clang
  export HOSTCXX=clang++
  export HOSTAR=llvm-ar
  export HOSTLD=ld.lld

Отлично, теперь вы можете собрать нужные вам пакеты (программы) через LLVM/Clang просто добавив к уже известной команде makepkg следующие параметры::

  makepkg --config /etc/makepkg-clang.conf -sric

.. attention:: Далеко не все пакеты так уж гладко собираются через Clang, в частности не пытайтесь собирать им Wine/DXVK,
   т.к. это официально не поддерживается и с 98% вероятностью приведет к ошибке сборки.
   Но в случае неудачи вы всегда можете использовать компиляторы GCC, которые у вас заданы в настройках makepkg.conf по умолчанию,
   т.е. просто уберите опцию ``--config /etc/makepkg-clang.conf`` из команды ``makepkg``.

Дальнейшеная пересборка пакетов из официальных репозиториев осуществима через следующее команды::

  git clone --depth 1 --branch packages/package https://github.com/archlinux/svntogit-packages.git package
  cd package/trunk
  makepkg --config /etc/makepkg-clang.conf -sric --skippgpcheck

Где *package* - название нужного вам пакета.

Мы рекомендуем вам пересобрать наиболее важные пакеты. Например такие как драйвера (то есть `mesa <https://archlinux.org/packages/extra/x86_64/mesa/>`_, `lib32-mesa <https://archlinux.org/packages/multilib/x86_64/lib32-mesa/>`_, если у вас Intel/AMD),
`Xorg сервер <https://archlinux.org/packages/extra/x86_64/xorg-server/>`_, а также связанные с ним компоненты, или `Wayland <https://archlinux.org/packages/extra/x86_64/wayland/>`_,
критически важные пакеты вашего DE/WM, например: `gnome-shell <https://aur.archlinux.org/packages/gnome-shell-performance>`_, `plasma-desktop <https://archlinux.org/packages/extra/x86_64/plasma-desktop/>`_.
А также композиторы `kwin <https://archlinux.org/packages/extra/x86_64/kwin/>`_, `mutter <https://aur.archlinux.org/packages/mutter-performance>`_, picom и т.д. в зависимости от того, чем именно вы пользуетесь.


Больше подробностей по теме вы можете найти в данной статье:

https://habr.com/ru/company/ruvds/blog/561286/

.. index:: clang, native-compilation, llvm-bolt-builds, lto, pgo
.. _speeding-up-clang-llvm-compilers:

Ускорение работы компиляторов LLVM/Clang
-----------------------------------------

Дополнительно можно отметить, что после установки Clang вы можете перекомпилировать его самого через себя,
т.е. выполнить пересборку Clang с помощью бинарного Clang из репозиториев.
Это позволит оптимизировать уже сам компилятор под ваше железо и тем самым ускорить
его работу при сборке уже других программ. Аналогичную операцию вы можете проделать и с GCC.

Делается это так же, как и с любыми другими пакетами из официальных репозиториев::

  git clone --depth 1 --branch packages/clang https://github.com/archlinux/svntogit-packages.git clang
  cd clang/trunk
  makepkg --config /etc/makepkg-clang.conf -sric --skippgpcheck

.. index:: makepkg, ccache, native-compilation
.. _enabling_ccache:

-----------------------
Включение ccache
-----------------------

В Linux системах есть не так много программ, сборка которых может занять больше двух часов,
но они все таки есть. Потому, было бы неплохо ускорить повторную компиляцию таких программ как Wine/Proton-GE и т.д.

ccache - это кэш для компиляторов C/C++, в частности совместимый с компиляторами GCC/Clang,
цель которого состоит в ускорении повторного процесса компиляции одного и того же кода.
Это значит, что если при сборке программы новой версии, будут замечены полностью идентичные блоки исходного кода в сравнении с его старой версией,
то компиляция этих исходных текстов производиться не будет. Вместо этого, уже готовый, скомпилированный код старой версии будет вынут из кэша ccache.
За счёт этого и достигается многократное ускорение процесса компиляции.

**Установка** ::

  sudo pacman -S ccache

После установки его ещё нужно активировать в ваших настройках makepkg.
Для этого отредактируем конфигурационный файл::

  sudo nano /etc/makepkg.conf

  # Найдите данную строку в собственных настройках, затем уберите восклицательный знак перед *"ccache"*
  BUILDENV=(!distcc color ccache check !sign)

После этого повторная пересборка желаемых программ и их обновление должны значительно ускориться.

.. attention:: ccache может ломать сборку некоторых программ, поэтому будьте внимательны с его применением.

.. index:: installation, ananicy, zram, nohang, rng-tools, haveged, trim, dbus-broker
.. _daemons-and-services:

======================================
Установка полезных служб и демонов
======================================

**1.** `Zramswap <https://aur.archlinux.org/packages/zramswap/>`_ — это специальный демон,
который сжимает оперативную память ресурсами центрального процессора и создает в ней файл подкачки.
Очень ускоряет систему вне зависимости от количества памяти, однако добавляет нагрузку на процессор, т.к. его ресурсами и происходит сжатие памяти.
Поэтому, на слабых компьютерах с малым количеством ОЗУ, это может негативно повлиять на производительность в целом. ::

  git clone https://aur.archlinux.org/zramswap.git  # Скачивание исходников.
  cd zramswap                                       # Переход в zramswap.
  makepkg -sric                                     # Сборка и установка.
  sudo systemctl enable --now zramswap.service      # Включаем службу.

**1.1** `Nohang <https://github.com/hakavlad/nohang>`_  — это демон повышающий производительность путём обработки и слежки за потреблением памяти. ::

  git clone https://aur.archlinux.org/nohang-git.git # Скачивание исходников.
  cd nohang-git                                      # Переход в nohang-git
  makepkg -sric                                      # Сборка и установка.
  sudo systemctl enable --now nohang-desktop         # Включаем службу.

**1.2** `Ananicy CPP <https://gitlab.com/ananicy-cpp/ananicy-cpp>`_ — это форк одноименного демона, распределяющий приоритет задач. Его установка очень сильно повышает отклик системы. В отличии от оригинального Ananicy, данный форк переписан полностью на C++, из-за чего достигается прирост в скорости работы. ::

  git clone https://aur.archlinux.org/ananicy-cpp.git # Скачивание исходников.
  cd ananicy-cpp                                      # Переход в ananicy-cpp.
  makepkg -sric                                       # Сборка и установка.
  sudo systemctl enable --now ananicy-cpp             # Включаем службу.
  
  # Далее описывается установка дополнительных правил по перераспределению приоритетов процессов
  git clone https://aur.archlinux.org/ananicy-rules-git.git # Скачивание исходников
  cd ananicy-rules-git                                      # Переход в директорию
  makepkg -sric                                             # Сборка и установка
  sudo systemctl restart ananicy-cpp                        # Перезапускаем службу  

**1.3** Включаем `TRIM <https://ru.wikipedia.org/wiki/Trim_(команда_для_накопителей)>`_ — очень полезно для SSD. ::

  sudo systemctl enable fstrim.timer    # Включаем службу.
  sudo fstrim -v /                      # Ручной метод.
  sudo fstrim -va /                     # Если первый метод не тримит весь диск.

**1.4** `Сron <https://wiki.archlinux.org/title/cron>`_ — это демон, который поможет вам очищать вашу систему от мусора полностью автономно. ::

  sudo pacman -S cronie                         # Установить cron.
  sudo systemctl enable --now cronie.service    # Запускает и включает службу.
  sudo EDITOR=nano crontab -e                   # Редактируем параметр.

И прописываем:

*15 10 * * sun /sbin/pacman -Scc --noconfirm*

Таким образом наша система будет чистить свой кэш раз в неделю, в воскресенье в 15:10.

**1.5** `haveged <https://wiki.archlinux.org/title/Haveged_(Русский)>`_ - это демон, что следит за энтропией системы.
Необходим для ускорения запуска системы при высоких показателях в: *systemd-analyze blame* (Больше 1 секунды). ::

  sudo pacman -S haveged        # Установка
  sudo systemctl enable haveged # Включает и запускает службу.

**1.5.1** `rng-tools <https://wiki.archlinux.org/title/Rng-tools>`_ - демон, что также следит за энтропией системы, но в отличие от haveged уже через аппаратный таймер.
Необходим для ускорения запуска системы при высоких показателях *systemd-analyze blame* (Больше 1 секунды). ::

  sudo pacman -S rng-tools         # Установка
  sudo systemctl enable --now rngd # Включает и запускает службу.

**1.6** `dbus-broker <https://github.com/bus1/dbus-broker>`_ - Это реализация шины сообщений в соответствии со спецификацией D-Bus.
Её цель - обеспечить высокую производительность и надежность при сохранении совместимости с эталонной реализацией D-Bus.
Обеспечивает чуть более быстрое общение с видеокартой через PCIe. ::

  sudo pacman -S dbus-broker                         # Уставновка
  sudo systemctl enable --now dbus-broker.service    # Включает и запускает службу.
  sudo systemctl --global enable dbus-broker.service # Включает и запускает службу для всех пользователей.

Если у вас ещё возникает вопрос: "Что действительно нужно установить из вышеперечисленного?",
то просто посмотрите на следующую схему:

.. image:: images/generic-system-acceleration-1.png

.. index:: lowlatency, audio, pusleaudio
.. _lowlatency-audio:

=============================
Низкие задержки звука
=============================

Установите следующие пакеты для понижения задержек звука в PulseAudio,
а также удобную графическую панель управления звуком -  *pavucontrol*.

::

  sudo pacman -S jack2 pulseaudio-alsa pulseaudio-jack pavucontrol jack2-dbus realtime-privileges

.. index:: installation, lowlatency, audio, pipewire
.. _pipewire-installation:

------------------------------
Новая альтернатива PulseAudio
------------------------------

`PipeWire <https://wiki.archlinux.org/title/PipeWire_(Русский)>`_ - это новая альтернатива PulseAudio,
которая призвана избавить от проблем pulse, уменьшить задержки звука и потребление памяти. ::

  sudo pacman -S jack2 pipewire pipewire-jack pipewire-alsa pavucontrol pipewire-pulse alsa-utils

.. index:: lowlatency, audio, alsa
.. _alsa:

-------------
Простая ALSA
-------------

ALSA - это тот самый звук (условно, на самом деле это звуковая подсистема ядра),
который идёт напрямую из ядра и является самым быстрым,
так как не вынужден проходить множество программных прослоек и микширование. ::

  sudo pacman -S alsa alsa-utils alsa-firmware alsa-card-profiles alsa-plugins

Поэтому, если у вас нет потребности в микшировании каналов,
записи аудио через микрофон и вы не слушаете музыку через Bluetooth, то ALSA может вам подойти.Пакет *alsa-utils* также содержит консольный Микшер (настройка громкости), который вызывается командой alsamixer.

Вообще, выбор звукового сервера не такая уж сложная задача как вам может показаться,
достаточно взглянуть на следующую схему:

.. image:: images/generic-system-acceleration-2.png

.. index:: startup-acceleration, networkmanager, service, 
.. _startup-acceleration:

===================================================================
Ускорение загрузки системы (Отключение NetworkManager-wait-online)
===================================================================

В большинстве случаев для настройки интернет подключения вы, скорее всего, будете использовать NetworkManager,
т.к. он является в этом деле швейцарским ножом и поставляется по умолчанию.
Однако, если вы пропишите команду *systemd-analyze blame*, то узнаете, что он задерживает загрузку системы примерно на ~4 секунды.
Чтобы это исправить выполните::

  sudo systemctl mask NetworkManager-wait-online.service

.. index:: startup-acceleration, hdd, lz4, mkinitcpio
.. _speed-up-hdd-startup:

------------------------------------------------------------------------
Ускорение загрузки ядра на HDD накопителях (*Только для жестких дисков*)
------------------------------------------------------------------------

Убедитесь, что пакет `lz4 <https://archlinux.org/packages/core/x86_64/lz4/>`_ установлен::

  sudo pacman -S lz4

Отредактируйте файл:::

  sudo nano /etc/mkinitcpio.conf

Теперь выполните следующие действия:

-  Добавьте *lz4 lz4_compress* в массив *MODULES* (ограничен скобками)
-  Раскомментируйте или добавьте строку с надписью *COMPRESSION="lz4"*
-  Добавьте строку если её нет -  *COMPRESSION_OPTIONS="-9"*
-  Добавите *shutdown* в массив *HOOKS* (ограничен скобками)

Это ускорит загрузку системы на слабых жёстких дисках благодаря более подходящему методу сжатия образов ядра.

.. index:: pacman, settings, parallel-downloading
.. _parallel-downloading:

=============================================
Одновременная загрузка двух и более пакетов
=============================================

Начиная с шестой версии pacman поддерживает параллельную загрузку пакетов.
Чтобы её включить отредактируйте */etc/pacman.conf*::

  sudo nano /etc/pacman.conf # Раскомментируйте строчку ниже

  # Где 4 - количество пакетов для одновременной загрузки
  ParallelDownloads = 4

.. index:: powerpill, parallel-downloading
.. _powerpill:

------------------------------------------------------------------
Альтернативно можно использовать powerpill (Спасибо Zee Captain)
------------------------------------------------------------------

::

  git clone https://aur.archlinux.org/powerpill.git
  cd powerpill
  makepkg -sric

После установки выполните обновление баз данных::

  sudo powerpill -Syu


======================
Твики драйверов Mesa
======================

.. index:: amd, sam, bar
.. _force_amd_sam:

--------------------------------------------------------------------------
Форсирование использования AMD SAM *(Только для опытных пользователей)*.
--------------------------------------------------------------------------

AMD Smart Acess Memory (или Resizble Bar) — это технология которая позволяет процессору получить доступ сразу ко всей видеопамяти GPU,
а не по отдельности для каждого распаянного чипа создавая задержки. Несмотря на то,
что данная технология заявлена только для оборудования AMD и требует новейших комплектующих для обеспечения своей работы,
мы активируем технологию для видеокарты 10 летней давновсти ATI Radeon HD 7770 и сравним буст производительности в паре игр.

.. danger:: Для включения данной технологии в настройках вашего BIOS (UEFI) должна быть включена опция *"Re-Size BAR Support"* и *"Above 4G Decoding"*.
   Если таких параметров в вашем BIOS (UEFI) нет - скорее всего технология не поддерживается вашей материнской платой и не стоит даже пытаться её включить.

Чтобы активировать SAM в Linux нужно отредактировать конфигурацию DRI, дописав в конфиг следующие строки::

  nano ~/.drirc # Редактируем конфигурационный файл

  # Прописать строки ниже

  <?xml version="1.0" standalone="yes"?>
  <driconf>
    <device>
      <application name="Default">
        <option name="radeonsi_enable_sam" value="true" />
      </application>
    </device>
  </driconf>

Альтернативно её можно активировать через глобальные переменные окружения::

  sudo nano /etc/enviroment # Редактируем конфигурационный файл

  # Добавить следующие строки
  radeonsi_enable_sam=true
  # Если используете драйвер RADV
  RADV_PERFTEST=sam

Проверить работу технологии можно через команду::

  AMD_DEBUG=info glxinfo | grep smart # Должно быть smart_access_memory = 1

**Пример тестирования технологии на видеокарте старого поколения (Windows)**

https://youtu.be/tZmPi9tfLbc

.. index:: amd, tweaks
.. _bug_solution_for_vega:

-------------------------------------------------------------------
Решение проблем работы графики Vega 11 (Спасибо @Vochatrak-az-ezm)
-------------------------------------------------------------------

На оборудовании со встроенным видеоядром Vega 11 может встретиться баг драйвера, при котором возникают случайные зависания графики.
Проблема наиболее актуальна для *Ryzen 2XXXG* и чуть реже встречается на Ryzen серии *3XXXG*, но потенциально имеет место быть и на более
новых видеоядрах Vega.

Решается через добавление следующих параметров ядра::

  # Редактируем конфигурационный файл в зависимости от того, какой у вас загрузчик
  sudo nano /etc/default/grub

  # Параметры можно дописать к уже имеющимся
  GRUB_CMDLINE_LINUX_DEFAULT="mdgpu.gttsize=8192 amdgpu.lockup_timeout=1000 amdgpu.gpu_recovery=1 amdgpu.noretry=0 amdgpu.ppfeaturemask=0xfffd3fff amdgpu.deep_color=1 systemd.unified_cgroup_hierarchy=true"

На всякий случай можно дописать ещё одну переменную окружения::

  # Прописать строчку ниже
  sudo nano /etc/enviroment

  AMD_DEBUG=nodcc

Для подробностей можете ознакомиться со следующими темами:

https://www.linux.org.ru/forum/linux-hardware/16312119

https://www.linux.org.ru/forum/desktop/16257286
