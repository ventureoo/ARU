.. ARU (c) 2018 - 2025, Pavel Priluckiy, Vasiliy Stelmachenok and contributors

   ARU is licensed under a
   Creative Commons Attribution-ShareAlike 4.0 International License.

   You should have received a copy of the license along with this
   work. If not, see <https://creativecommons.org/licenses/by-sa/4.0/>.

.. _services:

*****************
Настройка служб
*****************

.. _recommended_servies:

================
Полезные службы
================

.. index:: zram, swap
.. _zram-generator:

-----------------
zram-generator
-----------------

`zram-generator <https://github.com/systemd/zram-generator>`__ — демон
для создания блочных устройств ZRAM. ZRAM - это альтернативный
механизм подкачки в ядре Linux, который позволяет избавиться от
обычной подкачки на диске и сжимать неиспользуемые данные прямо внутри
памяти ресурсами CPU. Больше подробностей о том, как именно работает
подкачка и в частности ZRAM вы можете в разделе
:ref:`kernel-parameters`. Установка ``zram-generator`` выполняется
всего парой команд::

  sudo pacman -S zram-generator

После установки необходимо создать конфиг с указанием всех желаемых параметров,
таких как алгоритм сжатия и размер блочного устройства:

.. code-block:: shell
   :caption: ``/etc/systemd/zram-generator.conf``

   [zram0]
   zram-size = ram
   compression-algorithm = zstd
   swap-priority = 100
   fs-type = swap

Здесь мы указываем размер ZRAM равным количеству оперативной памяти
(``zram-size``), а также алгоритм сжатия zstd. Это позволит экономить больше
памяти, так как по заверениям разработчиков, эффективность сжатия в среднем
равна 1:3, что позволяет хранить внутри ZRAM объем данных больший, чем вы в
принципе можете уместить в ОЗУ. Вы также можете указать размер даже больший чем
RAM, к примеру ``ram * 2``, чтобы гарантировать, что размера блочного
устройства всегда хватит для сжатия большего количества страниц.

После создания файла конфигурации можно запускать саму службу::

  sudo systemctl daemon-reload
  sudo systemctl start systemd-zram-setup@zram0.service

.. warning:: Во избежание конфликтов, после установки zram обязательно
   отключите zswap через добавление параметра ядра ``zswap.enabled=0``.

.. note:: Как уже было сказано ранее, сжатие страниц в памяти
   осуществляется ресурсами CPU, но если он у вас достаточно слабый,
   то вы можете оказаться чувствительными к задержкам на
   распаковку/сжатие большого объема страниц. В этом случае имеет
   смысл либо вернуться к использованию обычного свопа, либо
   использовать менее ресурсоемкий алгоритм сжатия
   (``compression-algorithm``) как ``lzo``.


.. index:: oom, earlyoom
.. _oom_killer:

--------
earlyoom
--------

OOM киллером называют специальный демон, который предотвращает
возникновение так называемых OOM (Out-Of-Memory) ситуаций. Если по
простому, то он просто убивает самый "прожорливый" процесс в системе
прежде, чем он забьет всю память и ваш компьютер зависнет. В ядре
Linux уже есть встроенный OOM киллер, но он отличается медленной
скоростью реакции, поэтому лучше использовать OOM киллер, работающий в
пространстве пользователя. В репозитории Arch Linux и многих других
дистрибутивов есть простой в использовании демон - ``earlyoom``,
который отличается малым потреблением ресурсом в фоне и не создает
нагрузки на процессор, которая свойственна другим OOM киллерам из-за
постоянного отслеживания потребления памяти процессов без
использования специального механизма PSI, предлагаемым ядром Linux
начиная с версии 4.20. Поэтому именно его и рекомендуется
использовать. Установить его можно при помощи пары команд::

  sudo pacman -S earlyoom
  sudo systemctl enable --now earlyoom

Никакой дополнительной настройки демона как правило не требуется,
однако вы всегда можете обратиться к справочному руководству для
получения полного перечня различных параметров запуска: ``man
earlyoom``.

.. index:: ananicy, cpu, io, renice
.. _ananicy_cpp:

--------------
Ananicy CPP
--------------

`Ananicy CPP <https://gitlab.com/ananicy-cpp/ananicy-cpp>`__ — это
форк одноименного демона, распределяющий приоритет задач. Его
установка очень сильно повышает отклик системы. В отличии от
оригинального Ananicy, данный форк переписан полностью на C++, из-за
чего достигается прирост в скорости работы::

  sudo pacman -S ananicy-cpp
  sudo systemctl enable --now ananicy-cpp

Кроме того рекомендуется установить уже готовую, большую базу правил для
ananicy-cpp::
  
  # Далее описывается установка дополнительных правил по перераспределению приоритетов процессов
  git clone https://aur.archlinux.org/cachyos-ananicy-rules-git.git
  cd cachyos-ananicy-rules-git
  makepkg -sric
  sudo systemctl restart ananicy-cpp

.. index:: ssd, trim, systemd
.. _trim:

-----
TRIM
-----

`TRIM
<https://ru.wikipedia.org/wiki/Trim_(команда_для_накопителей)>`__ -
это встроенная команда контроллера для очищения уже неиспользуемых
ячеек на твердотельном накопителе. Её очень полезно периодически
выполнять с целью профилактики SSD. Чтобы это происходило
автоматически раз в неделю рекомендуется включить уже готовую службу::

  sudo systemctl enable fstrim.timer

Если по каким-то причинам вы не используете systemd или вам нужно
выполнить TRIM прямо сейчас воспользуйтесь одноименной командой
``fstrim``::

   sudo fstrim -v /

.. warning:: Если вы используйте файловую систему Btrfs и имеете
   версию ядра 6.2 и выше, то выполнять включение службы для
   осуществления периодическего выполнения команды TRIM - не нужно, т.
   к. Btrfs сам выполняет её в асинхронном режиме.

.. index:: irq, kernel, latency
.. _irqbalance:

-------------
irqbalance
-------------

`irqbalance <https://github.com/Irqbalance/irqbalance>`__ - это демон,
что автоматически балансирует обработку прерываний по ядрам
процессора. ::

  sudo pacman -S irqbalance
  sudo systemctl enable --now irqbalance

.. index:: systemd, disabling, services, gsd, cinnamon
.. _disabling-unnecessary-services:

=========================
Отключение лишних служб
=========================

Мы разобрались с установкой и включением полезных служб, теперь
неплохо было бы отключить все лишнее, что есть в системе. Для этого
прежде всего нужно проанализировать какие службы тормозят запуск
системы при помощи следующей команды: ``systemd-analyze blame`` - она
отсортирует все службы по скорости их загрузки. Не следует торопиться
и отключать все подряд, нужно внимательно вчитываться в описание
каждой службы. Стоит обратить свое внимание также на пользовательские
службы рабочих окружений KDE Plasma, GNOME и Cinnamon (если вы их не
используете, то можете просто пропустить разделы связанные с ними).

.. index:: services, daemons, file-indexing, tracker3
.. _disabling-file-indexing:

-----------------------------
Службы индексирования файлов
-----------------------------

Многие пользователи Windows знают о службе индексирования поиска,
которая занимается тем, что в фоновом режиме проходит по всей файловой
системе в поисках новых файлов или каталогов, чтобы внести их в
собственную базу, которая будет использована для ускорения встроенного
поиска или поиска в файловом менеджере. На первый взгляд все звучит
хорошо, но на деле процессы всех подобных служб являются очень
прожорливыми и часто создают чрезмерную нагрузку на диск.

В Linux подобные службы есть только у рабочих окружений GNOME и KDE
Plasma. В KDE Plasma встроенным файловым индексатором является Baloo,
который отличается своей склонностью часто "подтекать" с точки зрения
потребления памяти, а в GNOME есть Tracker 3, который хоть и менее
прожорливый по сравнению с аналогом от KDE, но все ещё потребляет не
мало ресурсов.

Так как отключение всех подобных служб может положительно влиять на
жизненный цикл вашего носителя, то рекомендуется выполнить это сразу
после установки в зависимости от вашего рабочего окружения:

.. tab-set::

   .. tab-item:: GNOME > 47

      ::

         systemctl --user mask localsearch-3.service localsearch-control-3.service \
            localsearch-writeback-3.service

   .. tab-item:: GNOME <= 46

      ::

         systemctl --user mask tracker-extract-3 tracker-miner-fs-3 \
            tracker-miner-fs-control-3 tracker-miner-rss-3 tracker-writeback-3 \
            tracker-xdg-portal-3
         rm -rf ~/.cache/tracker ~/.local/share/tracker

   .. tab-item:: KDE Plasma

      ::

         balooctl6 suspend
         balooctl6 disable
         balooctl6 purge

.. warning:: Обратите внимание, что после отключения встроенный поиск
   в GNOME и KDE Plasma может работать немного медленнее.

.. index:: services, gnome, cinnamon, gsd, csd
.. _disabling_gcsd_services:

------------------------------------------------
Отключение пользовательских служб GNOME/Cinnamon
------------------------------------------------

GSD (gnome-settings-daemon) - это, как следует из названия, службы
настройки GNOME и связанных приложений. Если отойти от строгого
определения, то это просто службы-настройки на все случаи жизни,
которые просто висят у вас в оперативной памяти в ожидании когда вам,
или другому приложению, к примеру, понадобиться настроить или
интегрировать поддержку планшета Wacom в рабочее окружение, или для
уведомления вас о различных событиях, таких как недостаточное место на
диске или начале печати, а также для применения изменений совершенных
в настройках GNOME на лету. Так как другое рабочее окружение - Cinnamon,
является форком GNOME 3, то оно также имеет собственные службы
настройки, называемые CSD службами, и большая часть из них являются
"близницами" тех служб, которые есть в GNOME, поэтому их функционал во
многом совпадает. Все команды по отключению служб с одинаковым
назначением в обоих окружения будут продублированы.

Служба интеграции рабочего окружения с графическим планшетом Wacom.
Позволяет настраивать яркость планшета средствами окружения (GNOME или
Cinnamon). Если у вас такого нет - смело отключайте:

.. tab-set::

   .. tab-item:: GNOME

      ::

         systemctl --user mask org.gnome.SettingsDaemon.Wacom.service

   .. tab-item:: Cinnamon

      ::

         cp -v /etc/xdg/autostart/cinnamon-settings-daemon-wacom.desktop ~/.config/autostart
         echo "Hidden=true" >> ~/.config/autostart/cinnamon-settings-daemon-wacom.desktop

Служба уведомления о начале печати. Если нет принтера или
вам просто не нужны эти постоянные уведомления - отключаем:

.. tab-set::

   .. tab-item:: GNOME

      ::

         systemctl --user mask org.gnome.SettingsDaemon.PrintNotifications.service

   .. tab-item:: Cinnamon

      ::

         cp -v /etc/xdg/autostart/cinnamon-settings-daemon-print-notifications.desktop ~/.config/autostart
         echo "Hidden=true" >> ~/.config/autostart/cinnamon-settings-daemon-print-notifications.desktop

Службы управления цветовыми профилями дисплея и принтеров. Если вы
отключите данную службу, то не будет работать тёплый режим экрана
(Системный аналог Redshift):

.. tab-set::

   .. tab-item:: GNOME

      ::

         systemctl --user mask org.gnome.SettingsDaemon.Color.service

   .. tab-item:: Cinnamon

      ::

         cp -v /etc/xdg/autostart/cinnamon-settings-daemon-color.desktop ~/.config/autostart
         echo "Hidden=true" >> ~/.config/autostart/cinnamon-settings-daemon-color.desktop

Отключение службы управления специальными возможностями системы:

.. tab-set::

   .. tab-item:: GNOME

      ::

         systemctl --user mask org.gnome.SettingsDaemon.A11ySettings.service

   .. tab-item:: Cinnamon

      ::

         cp -v /etc/xdg/autostart/cinnamon-settings-daemon-a11y-*.desktop ~/.config/autostart
         echo "Hidden=true" >> ~/.config/autostart/cinnamon-settings-daemon-a11y-*.desktop

.. attention:: Не отключать данную службу людям с ограниченными
   возможностями (инвалидам)!

Службы управления беспроводными интернет-подключениями и Bluetooth. Не
рекомендуется отключать для ноутбуков с активным использованием Wi-Fi
и Bluetooth, но если вы используете настольный ПК без использования
беспроводных технологий, то смело отключайте:

.. tab-set::

   .. tab-item:: GNOME

      ::

         systemctl --user mask org.gnome.SettingsDaemon.Wwan.service
         systemctl --user mask org.gnome.SettingsDaemon.Rfkill.service

   .. tab-item:: Cinnamon

      ::

         cp -v /etc/xdg/autostart/cinnamon-settings-daemon-rfkill.desktop ~/.config/autostart
         echo "Hidden=true" >> ~/.config/autostart/cinnamon-settings-daemon-rfkill.desktop

Отключение службы защиты от неавторизованных USB устройств при
блокировке экрана:

.. tab-set::

   .. tab-item:: GNOME

      ::

         systemctl --user mask org.gnome.SettingsDaemon.UsbProtection.service

.. note:: Данная служба может быть полезна если у вас ноутбук и вы
   часто посещаете вместе ним общественные места.

Службу для автоматической блокировки экрана. Можете отключить по
собственному желанию:

.. tab-set::

   .. tab-item:: GNOME

      ::

         systemctl --user mask org.gnome.SettingsDaemon.ScreensaverProxy.service

   .. tab-item:: Cinnamon

      ::

         cp -v /etc/xdg/autostart/cinnamon-settings-daemon-screensaver-proxy.desktop ~/.config/autostart
         echo "Hidden=true" >> ~/.config/autostart/cinnamon-settings-daemon-screensaver-proxy.desktop

Служба для автоматического управления общим доступом к файлам и
директориям. Если никогда не пользовались, можете отключить:

.. tab-set::

   .. tab-item:: GNOME

      ::


         systemctl --user mask org.gnome.SettingsDaemon.Sharing.service

.. note:: Данная служба есть только в окружении GNOME.

Служба интеграции рабочего окружения с карт-ридером. Если у вас
карт-ридера нет, то смело отключайте:

.. tab-set::

   .. tab-item:: GNOME

     ::

        systemctl --user mask org.gnome.SettingsDaemon.Smartcard.service

   .. tab-item:: Cinnamon

     ::

        cp -v /etc/xdg/autostart/cinnamon-settings-daemon-smartcard.desktop ~/.config/autostart
        echo "Hidden=true" >> cinnamon-settings-daemon-smartcard.desktop

Служба автоматического оповещения вас о недостаточном количестве
свободного места на диске. Если вы делаете это самостоятельно при
помощи специальных средств, как например Baobab, то можно отключить
данную службу:

.. tab-set::

   .. tab-item:: GNOME

     ::

        systemctl --user mask org.gnome.SettingsDaemon.Housekeeping.service

   .. tab-item:: Cinnamon

     ::

        cp -v /etc/xdg/autostart/cinnamon-settings-daemon-housekeeping.desktop ~/.config/autostart
        echo "Hidden=true" >> cinnamon-settings-daemon-housekeeping.desktop


Служба управления питанием и функциями энергосбережения. Рекомендуется
оставить эту службу включенной если у вас ноутбук, т. к. без неё не
будет работать регулирование яркости средствами рабочего окружения и
управление сном, но можете отключить, если у вас настольный ПК:

.. tab-set::

   .. tab-item:: GNOME

     ::

        systemctl --user mask org.gnome.SettingsDaemon.Power.service

   .. tab-item:: Cinnamon

     ::

        cp -v /etc/xdg/autostart/cinnamon-settings-daemon-power.desktop ~/.config/autostart
        echo "Hidden=true" >> cinnamon-settings-daemon-power.desktop

Служба интеграции работы буфера обмена c Cinnamon. Если вы никогда не
пользовались виджетом истории буфера обмена в трее, то можете
отключить данную службу:

.. tab-set::

   .. tab-item:: Cinnamon

     ::

        cp -v /etc/xdg/autostart/cinnamon-settings-daemon-clipboard.desktop ~/.config/autostart
        echo "Hidden=true" >> cinnamon-settings-daemon-clipboard.desktop

.. note:: Данная служба есть только в окружении Cinnamon.

Служба для автоматического подстраивания интерфейса Cinnamon при
повороте дисплея. Если у вас нет сенсорного экрана или поддержки
переворота дисплея - смело отключайте:

.. tab-set::

   .. tab-item:: Cinnamon

     ::

        cp -v /etc/xdg/autostart/cinnamon-settings-daemon-orientation.desktop ~/.config/autostart
        echo "Hidden=true" >> cinnamon-settings-daemon-orientation.desktop

.. note:: Данная служба есть только в окружении Cinnamon.

Если после отключения какой-либо из вышеперечисленных служб что-то
пошло не так, или просто какую-либо из них понадобилось снова
включить, то выполните следующую команду в зависимости от
используемого рабочего окружения предварительно подставив
имя в неё нужной службы:

.. tab-set::

   .. tab-item:: GNOME

     ::

        systemctl --user unmask --now СЛУЖБА

   .. tab-item:: Cinnamon

     ::

        rm ~/.config/autostart/cinnamon-settings-daemon-СЛУЖБА.desktop

Служба вернется в строй после перезагрузки рабочего окружения.

.. vim:set textwidth=70:
