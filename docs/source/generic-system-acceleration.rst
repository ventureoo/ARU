.. ARU (c) 2018 - 2021, Pavel Priluckiy, Vasiliy Stelmachenok and contributors

   ARU is licensed under a
   Creative Commons Attribution-ShareAlike 4.0 International License.

   You should have received a copy of the license along with this
   work. If not, see <https://creativecommons.org/licenses/by-sa/4.0/>.

""""""""""""""""""""""""""
Базовое ускорение системы
""""""""""""""""""""""""""

.. contents:: Содержание:
  :depth: 3

.. role:: bash(code)
  :language: shell

======================
Настройка makepkg.conf
======================

Прежде чем приступать к сборке пакетов, мы должны изменить так называемые флаги компиляции,
что являются указателями для компилятора, какие инструкции и оптимизации использовать при сборке программ.

:bash:`sudo nano /etc/makepkg.conf`  # Редактируем

**Изменить ваши значения на эти:**::

  CFLAGS="-march=native -mtune=native -O3 -pipe -fno-plt -fexceptions \
        -Wp,-D_FORTIFY_SOURCE=2 -Wformat -Werror=format-security \
        -fstack-clash-protection -fcf-protection"
  CXXFLAGS="$CFLAGS -Wp,-D_GLIBCXX_ASSERTIONS"
  RUSTFLAGS="-C opt-level=3"
  MAKEFLAGS="-j$(nproc) -l$(nproc)"
  OPTIONS=(strip docs !libtool !staticlibs emptydirs zipman purge !debug lto)

Данные флаги компилятора выжимают максимум производительности при компиляции, но могут вызывать ошибки сборки в очень редких приложениях.
Если такое случится, то измените O3 на O2 (Где O - **ЭТО не ноль/нуль**).
И отключите параметр ‘lto’ в строке options добавив перед ним символ восклицательного знака  ! (*"!lto"*).

======================================
Установка полезных служб и демонов
======================================

**1.** `Zramswap <https://aur.archlinux.org/packages/zramswap/>`_ — это специальный демон, который сжимает оперативную память ресурсами центрального процессора и создает в ней файл подкачки.
Очень ускоряет систему вне зависимости от количества памяти, однако добавляет нагрузку на процессор, т.к. его ресурсами и происходит сжатие памяти.
Поэтому, на слабых компьютерах с малым количеством ОЗУ, это может негативно повлиять на производительность в играх.::

  git clone https://aur.archlinux.org/zramswap.git  # Скачивание исходников.
  cd zramswap                                       # Переход в zramswap.
  makepkg -sric                                     # Сборка и установка.
  sudo systemctl enable --now zramswap.service      # Включаем службу.

**1.1** `Nohang <https://github.com/hakavlad/nohang>`_  — это демон повышающий производительность путём обработки и слежки за потреблением памяти.::

  git clone https://aur.archlinux.org/nohang-git.git # Скачивание исходников.
  cd nohang-git                                      # Переход в nohang-git
  makepkg -sric                                      # Сборка и установка.
  sudo systemctl enable --now nohang-desktop         # Включаем службу.

**1.2** `Ananicy <https://github.com/Nefelim4ag/Ananicy>`_ — это демон распределяющий приоритет задач, его установка очень сильно повышает отклик системы.::

  git clone https://aur.archlinux.org/ananicy.git # Скачивание исходников.
  cd ananicy                                      # Переход в ananicy.
  makepkg -sric                                   # Сборка и установка.
  sudo systemctl enable --now ananicy             # Включаем службу.

**1.3** Включаем `TRIM <https://ru.wikipedia.org/wiki/Trim_(команда_для_накопителей)>`_ — очень полезно для SSD.::

  sudo systemctl enable fstrim.timer    # Включаем службу.
  sudo fstrim -v /                      # Ручной метод.
  sudo fstrim -va /                     # Если первый метод не тримит весь диск.

**1.4** `Сron <https://wiki.archlinux.org/title/cron>`_ — это демон, поможет вам очищать нашу систему от мусора автономно.::

  sudo pacman -S cronie                         # Установить cron.
  sudo systemctl enable --now cronie.service    # Запускает и включает службу.
  sudo EDITOR=nano crontab -e                   # Редактируем параметр.

И прописываем:

*15 10 * * sun /sbin/pacman -Scc*

Таким образом наша система будет чистить свой кэш раз в неделю, в воскресенье в 15:10.

**1.5** `haveged <https://wiki.archlinux.org/title/Haveged_(Русский)>`_ - это демон, что следит на энтропией системы.
Необходим для ускорения запуска системы при высоких показателях в: *systemd-analyze blame* (Больше 1 секунды).::

  sudo pacman -S haveged        # Установка
  sudo systemctl enable haveged # Включает и запускает службу.

**1.5.1** `rng-tools <https://wiki.archlinux.org/title/Rng-tools>`_ - демон, что также следит на энтропией системы, но в отличии от haveged уже через аппаратный таймер.
Необходим для ускорения запуска системы при высоких показателях *systemd-analyze blame* (Больше 1 секунды). (**Не использовать вместе с Ananicy**).::

  sudo pacman -S rng-tools         # Установка
  sudo systemctl enable --now rngd # Включает и запускает службу.

**1.6** `dbus-broker <https://github.com/bus1/dbus-broker>`_ - Это реализация шины сообщений в соответствии со спецификацией D-Bus.
Его цель - обеспечить высокую производительность и надежность при сохранении совместимости с эталонной реализацией D-Bus.::

  sudo pacman -S dbus-broker                      # Уставновка
  sudo systemctl enable --now dbus-broker.service # Включает и запускает службу.

=============================
Сверхнизкие задержки звука
=============================

Установите следующие пакеты для понижения задержек звука в PulseAudio:::

  sudo pacman -S jack2 pulseaudio-alsa pulseaudio-jack pavucontrol jack2-dbus realtime-privileges

.. attention:: Пакет `realtime-privileges <https://archlinux.org/packages/community/any/realtime-privileges/>`_ - лучше не устанавливать, он может вызвать небольшие задержки всей системы, но без него звук хуже.

------------------------------
Новая альтернатива PulseAudio
------------------------------

`PipeWire <https://wiki.archlinux.org/title/PipeWire_(Русский)>`_ - это новая альтернатива PulseAudio, которая призвана избавить от проблем pulse,
уменьшить задержки звука и потребление памяти. Пакет *alsa-utils* также содержит консольный Микшер (настройка громкости), который вызывается командой alsamixer.::

  sudo pacman -S jack2 pipewire pipewire-jack pipewire-alsa pavucontrol pipewire-pulse alsa-utils

===================================================================
Ускорение загрузки системы (Отключение NetworkManager-wait-online)
===================================================================

В большинстве случаев для настройки интернет подключения вы, скорее всего, будете использовать NetworkManager,
т.к. он является в этом деле швейцарским ножом и поставляется по умолчанию.
Однако, если вы пропишите команду *systemd-analyze blame*, то узнаете, что он задерживает загрузку системы примерно на ~4 секунды.
Чтобы это исправить выполните:::

  sudo systemctl mask NetworkManager-wait-online.service

------------------------------------------------------------------------
Ускорение загрузки ядра на HDD накопителях (*Только для жестких дисков*)
------------------------------------------------------------------------

Убедитесь, что пакет `lz4 <https://archlinux.org/packages/core/x86_64/lz4/>`_ установлен:::

  sudo pacman -S lz4

Отредактируйте файл:::

  sudo nano /etc/mkinitcpio.conf

Теперь выполните следующие действия:

-  Добавьте *lz4 lz4_compress* в массив *MODULES* (ограничен скобками)
-  Раскомментируйте или добавьте строку с надписью *COMPRESSION="lz4"*
-  Добавьте строку если её нет -  *COMPRESSION_OPTIONS="-9"*
-  Добавите *shutdown* в массив *HOOKS* (ограничен скобками)

Это ускорит загрузку системы на слабых жёстких дисках благодаря более подходящему методу сжатия образов ядра.

=============================================
Одновременная загрузка двух и более пакетов
=============================================

Начиная с шестой версии pacman поддерживает параллельную загрузку пакетов.
Чтобы её включить отредактируйте */etc/pacman.conf*::

  sudo nano /etc/pacman.conf # Раскомментируйте строчку ниже

  # Где 4 - количество пакетов для одновременной загрузки
  ParallelDownloads = 4

------------------------------------------------------------------
Альтернативно можно использовать powerpill (Спасибо Zee Captain)
------------------------------------------------------------------

::

  git clone https://aur.archlinux.org/powerpill.git
  cd powerpill
  makepkg -sric

После установки выполните обновление баз данных::

  sudo powerpill -Syu

=============
Полезное ПО
=============

--------------
Stacer
--------------

Помощник в обслуживании и чистке системы.

.. image:: images/generic-system-acceleration-1.png

**Установка**::

  git clone https://aur.archlinux.org/stacer.git # Скачивание исходников. 
  cd stacer                                      # Переход в stacer. 
  makepkg -sric                                  # Сборка и установка.

---------------
Bleachbit
---------------

Аналог CCleaner для Linux, помогает выполнить чистку системы от накопившегося мусора.

.. image:: images/generic-system-acceleration-2.png

**Установка + дополнительные фильтры**::

  sudo pacman S bleachbit

  # Дополнительные фильтры

  git clone https://aur.archlinux.org/cleanerml-git.git # Скачивание исходников.
  cd cleanerml-git                                      # Переход в cleanerm.
  makepkg -sric                                         # Сборка и установка.

