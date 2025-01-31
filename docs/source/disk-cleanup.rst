.. ARU (c) 2018 - 2025, Pavel Priluckiy, Vasiliy Stelmachenok and contributors

   ARU is licensed under a
   Creative Commons Attribution-ShareAlike 4.0 International License.

   You should have received a copy of the license along with this
   work. If not, see <https://creativecommons.org/licenses/by-sa/4.0/>.

.. _disk-cleanup:

*******************
Профилактика диска
*******************

Рациональное использование пространства на диске также входит в перечень задач
по оптимизации системы. Хотя это и не влияет напрямую на производительность
самой системы, это позволяет всё время иметь пространство на носителе, чтобы
использовать его для хранения новой информации, поэтому в данном разделе
затрагивается тема профилактики носителя или же его чистки от "мусора":
различных временных данных, кэшей, баз данных.

.. index:: useful-programs, bleachbit, garbage-removal
.. _bleachbit:

=============================
Чистка при помощи Bleachbit
=============================

Аналог CCleaner для Linux, помогает выполнить очистку системы от накопившегося
в ней мусора.

Советуем выполнять чистку системы уже после проведения всех оптимизаций.

.. image:: images/generic-system-acceleration-4.png

**Установка + дополнительные фильтры**::

  sudo pacman -S bleachbit

  # Дополнительные фильтры

  git clone https://aur.archlinux.org/cleanerml-git.git # Загрузка исходников.
  cd cleanerml-git                                      # Переход в cleanerm.
  makepkg -sric                                         # Сборка и установка.

.. index:: pacman, cache, cleaner
.. _pacman_cleaner:

===================================
Автоматическая очистка кэша pacman
===================================

Кэш пакетов pacman имеет плохое свойство забиваться и со временем
занимает много места на диске. Чтобы этого не происходило, создадим
небольшой демон, который будет автоматически его очищать, например,
каждую неделю. В этом нам могут встроенные средства systemd для
создания таймеров - специальных служб, которые устанавливают
периодичность выполнения того или иного события, например, запуска
другой службы (в нашем случае службы очистки кэша). Напишем таймер,
выполняющий команду ``pacman -Scc`` регулярно раз в неделю с периодом
проверки времени один раз в час. Для этого сначала создадим службу,
которая будет регулярно выполняться, назовем её
``pacman-cleaner.service``:

.. code-block:: shell
  :caption: ``/etc/systemd/system/pacman-cleaner.service``

  [Unit]
  Description=Cleans pacman cache

  [Service]
  Type=oneshot
  ExecStart=/usr/bin/pacman -Scc --noconfirm

  [Install]
  WantedBy=multi-user.target

И для этой службы создадим соответствующий таймер, который будет активировать её
выполенение каждую неделю:

.. code-block:: shell
  :caption: ``/etc/systemd/system/pacman-cleaner.timer``

  [Unit]
  Description=Run clean of pacman cache every week

  [Timer]
  OnCalendar=weekly
  AccuracySec=1h
  Persistent=true

  [Install]
  WantedBy=timers.target

Не забываем включить этот самый таймер::

  sudo systemctl enable --now pacman-cleaner.timer


.. index:: sqlite3, cache, vacuum
.. _sqlite_cache_optimizing:

==============================
Оптимизация баз данных SQLite
==============================

Базы данных типа SQLite часто используется для локального хранения с целью
кэширования тех или иных данных. Например, Firefox использует SQLite базу
внутри текущего профиля для хранения всех пиктограм ранее посещаемых сайтов.
Базы такого типа поддаются оптимизации занимаемого места на диске через
специальную операцию ``VACUUM``.

Для профаликтики диска и экономии места вы можете захотеть периодически
выполнять данную операцию над всеми базами данных в вашей домашней директории
при помощи следующей команды::

  find ~/ -type f -regextype posix-egrep -regex '.*\.(db|sqlite)' \
    -exec bash -c '[ "$(file -b --mime-type {})" = "application/vnd.sqlite3" ] && sqlite3 {} "VACUUM; REINDEX;"' \; 2>/dev/null

.. warning:: Перед запуском данной команды рекомендуется закрыть все
   приложения, так как операция ``VACUUM`` не может быть выполнена для открытых
   и используемых в данный момент баз данных.

Данную команду рекомендуется периодически выполнять вручную или при помощи
systemd-таймера по аналогии с очисткой кэша pacman как было показано выше.

.. vim:set textwidth=70:
