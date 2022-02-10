.. ARU (c) 2018 - 2022, Pavel Priluckiy, Vasiliy Stelmachenok and contributors

   ARU is licensed under a
   Creative Commons Attribution-ShareAlike 4.0 International License.

   You should have received a copy of the license along with this
   work. If not, see <https://creativecommons.org/licenses/by-sa/4.0/>.

.. _extra-optimizations:

********************
Экстра оптимизации
********************

===============================================================================
Перевод процессора из стандартного энергосбережения в режим производительности
===============================================================================

По умолчанию ваш процессор динамически меняет свою частоту, что в принципе правильно и дает баланс между энергосбережением и производительностью.
Но если вы все таки хотите выжать все соки, то вы можете закрепить применение режима максимальной производительности для вашего процессора.
Это также поможет вам избегать "падений" частоты во время игры, которые могли вызывать микрофризы во время игры.

Закрепим режим максимальной производительности::

  sudo pacman -S cpupower                       # Установит менеджер управления частотой процессора
  sudo cpupower frequency-set -g performance    # Выставляет максимальную  производительность до перезагрузки системы.

``sudo nano /etc/default/cpupower`` # Редактируем строчку ниже

.. image:: images/extra-optimizations-1.png

*governor=’performance’* # Высокая производительность всегда!

``sudo systemctl enable cpupower`` # Включить как постоянную службу которая установит вечный perfomance mode.

.. index:: cpupower, gui, frequencies, governor, performance
.. _cpupower-gui:

GUI для изменение частоты процессора (*Может не работать с Xanmod*)
---------------------------------------------------------------------

.. image:: images/extra-optimizations-2.png

**Установка**::

  git clone https://aur.archlinux.org/cpupower-gui.git
  cd cpupower-gui
  makepkg -sric

.. index:: cpupower, auto-cpufreq, frequencies, governor, performance
.. _auto-cpufreq:

Альтернатива - Auto-Cpufreq
-----------------------------

**Установка**::

  git clone https://aur.archlinux.org/auto-cpufreq-git.git  # Скачиваем исходники
  cd auto-cpufreq-git                                       # Переходим в директорию
  makepkg -sric                                             # Сборка и установка
  systemctl enable auto-cpufreq                             # Включает службу как постоянную
  systemctl start auto-cpufreq                              # Запускает службу

.. attention:: Может конфликтовать со встроенным менеджером питания в GNOME 41+.
   Убедитесь, что он у вас выключен::

     sudo systemctl disable --now power-profiles-daemon.service

.. index:: hibernation, suspend, polkit
.. _disabling-hibernation-and-sleep:

==========================================
Отключение спящего режима и гибернации
==========================================

``sudo pacman -S polkit``  # Установить для управления системными привилегиями.

``sudo nano /etc/polkit-1/rules.d/10-disable-suspend.rules``  # Убираем спящий режим и гибернацию (из меню и вообще).
Если такого файла нет, то создайте его. Файл должен выглядеть вот так::

  polkit.addRule(function(action, subject) {
    if (action.id == "org.freedesktop.login1.suspend" ||
        action.id == "org.freedesktop.login1.suspend-multiple-sessions" ||
        action.id == "org.freedesktop.login1.hibernate" ||
        action.id == "org.freedesktop.login1.hibernate-multiple-sessions")
    {
        return polkit.Result.NO;
    }
  });

.. index:: kernel, dumps, coredump
.. _disabling-kernel-dumps:

============================================================
Отключение дампов ядра (*Только для опытных пользователей*)
============================================================

Отредактируйте */etc/systemd/coredump.conf* в разделе *[Coredump]* раскомментируйте *Storage = external* и замените его на *Storage = none*.

Затем выполните следующую команду:

``sudo systemctl daemon-reload``

Уже одно это действие отключает сохранение резервных копий, но они все еще находятся в памяти.
Если вы хотите полностью отключить дампы ядра, то измените *soft* на *#\* hard core 0* в */etc/security/limits.conf*.

.. index:: swap, swapfile
.. _disabling-swap:

===========================
Отключение файла подкачки
===========================

Для лучшей игровой производительности следует использовать файловую систему Btrfs и не задействовать файл подкачки
(вместо него стоит использовать выше упомянутый zramswap, конечно при условии что у вас не слишком слабый процессор и оперативной памяти больше чем 4 ГБ),
а также без страха отключать фиксы уязвимостей, которые сильно урезают производительность процессора (о них написано в следующем разделе).

::

  sudo swapoff /dev/sdxy  # Вместо xy ваше название (Например sdb1).
  sudo swapoff -a         # Отключает все swap-разделы/файлы
  sudo rm -f /swapfile    # Удалить файл подкачки с диска
  sudo nano /etc/fstab    # Уберите самую нижнюю строчку полностью.

