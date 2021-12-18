.. ARU (c) 2018 - 2021, Pavel Priluckiy, Vasiliy Stelmachenok and contributors

   ARU is licensed under a
   Creative Commons Attribution-ShareAlike 4.0 International License.

   You should have received a copy of the license along with this
   work. If not, see <https://creativecommons.org/licenses/by-sa/4.0/>.

""""""""""""""""""""
Экстра оптимизации
""""""""""""""""""""

.. contents:: Содержание:
  :depth: 3

.. role:: bash(code)
  :language: bash

===============================================================================
Перевод процессора из стандартного энергосбережения в режим производительности
===============================================================================

По умолчанию ваш процессор динамически меняет свою частоту, что в принципе правильно и дает баланс между энергосбережением и производительность.
Но если вы все таки хотите выжать все соки, то вы можете закрепить применение режима максимальной производительность для вашего процессора.
Это также поможет вам избегать "падений" частоты во время игры, которые могли вызывать микрофризы во время игры.

Закрепим режим максимальной производительности:

.. code:: bash

  sudo pacman -S cpupower                       # Установит менеджер управления частотой процессора
  sudo cpupower frequency-set -g performance    # Выставляет максимальную  производительность до перезагрузки системы.

:bash:`sudo nano /etc/default/cpupower` # Редактируем строчку ниже

*governor=’performance’* # Высокая производительность

:bash:`sudo systemctl enable cpupower` # Включить как постоянную службу, которая установит вечный perfomance mode.

GUI для изменение частоты процессора # Может не работать с Xanmod.
---------------------------------------------------------------------

**Установка**

.. code:: bash

  git clone https://aur.archlinux.org/cpupower-gui.git
  cd cpupower-gui
  makepkg -sric

Альтернатива - Auto-Cpufreq
-----------------------------

**Установка**

.. code:: bash

  git clone https://aur.archlinux.org/auto-cpufreq-git.git  # Скачиваем исходники
  cd auto-cpufreq-git                                       # Переходим в директорию
  makepkg -sric                                             # Сборка и установка
  systemctl enable auto-cpufreq                             # Включает службу как постоянную
  systemctl start auto-cpufreq                              # Запускает службу

==========================================
Отключение спящего режима и гибернации
==========================================

:bash:`sudo pacman -S polkit`  # Установить для управления системными привилегиями.

:bash:`sudo nano /etc/polkit-1/rules.d/10-disable-suspend.rules`  # Убираем спящий режим и гибернацию (из меню и вообще). Если этого файла нет, то создать. Файл должен выглядеть вот так:

.. code:: bash

  polkit.addRule(function(action, subject) {
    if (action.id == "org.freedesktop.login1.suspend" ||
        action.id == "org.freedesktop.login1.suspend-multiple-sessions" ||
        action.id == "org.freedesktop.login1.hibernate" ||
        action.id == "org.freedesktop.login1.hibernate-multiple-sessions")
    {
        return polkit.Result.NO;
    }
  });

============================================================
Отключение дампов ядра (*Только для опытных пользователей*)
============================================================

Отредактируйте */etc/systemd/coredump.conf* в разделе *[Coredump]* раскомментируйте *Storage = external* и замените его на *Storage = none*.

Затем выполните следующую команду:

:bash:`sudo systemctl daemon-reload`

Уже одно это действие отключает сохранение резервных копий, но они все еще находятся в памяти.
Если вы хотите полностью отключить дампы ядра, то измените *soft* на *#* hard core 0* в */etc/security/limits.conf*.

===========================
Отключение файла подкачки
===========================

.. code:: bash

  sudo swapoff /dev/sdxy  # Вместо xy ваше название (Например sdb1).
  sudo swapoff -a         # Отключает все swap-разделы/файлы
  sudo rm -f /swapfile    # Удалить файл подкачки с диска
  sudo nano /etc/fstab    # Уберите самую нижнюю строчку полностью.

Для лучшей игровой производительности следует использовать файловую систему Btrfs и не задействовать файл подкачки
(вместо него стоит использовать выше упомянутый zramswap, конечно при условии что у вас не слишком слабый процессор и оперативной памяти больше чем 4 ГБ),
а также без страха отключать фиксы уязвимостей, которые сильно урезают производительность процессора (о них написано в следующем разделе).
