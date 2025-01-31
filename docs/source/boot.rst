.. ARU (c) 2018 - 2025, Pavel Priluckiy, Vasiliy Stelmachenok and contributors

   ARU is licensed under a
   Creative Commons Attribution-ShareAlike 4.0 International License.

   You should have received a copy of the license along with this
   work. If not, see <https://creativecommons.org/licenses/by-sa/4.0/>.

.. _boot:

***************************
Ускорение загрузки системы
***************************

.. index:: startup-acceleration, hdd, lz4, mkinitcpio
.. _speed-up-initramfs-unpack:

-------------------------------
Ускорение распаковки initramfs
-------------------------------

Как уже было сказано, initramfs - это начальное загрузочное окружение,
которое идет в дополнение к образу ядра Linux и должно содержать в
себе все необходимые ядру модули и утилиты для его правильной загрузки
(прежде всего необходимые для монтирования корневого раздела). Для
экономии места на загрузочном разделе данное окружение поставляется в
виде саморасжимаемого архива, который распаковывается на лету во время
загрузки системы. В Arch Linux программа для генерации initramfs -
mkinitcpio, по умолчанию сжимает их при помощи алгоритма zstd, который
имеет оптимальные показатели скорости сжатия и расжатия. При этом
понятно, что скорость сжатия initramfs не так важна, как скорость
расжатия - ведь она напрямую влияет на скорость загрузки системы.
Поэтому для ускорения данного процесса лучше всего использовать
алгоритм с самой быстрой скоростью расжатия - ``lz4``.

Чтобы использовать ``lz4`` в качестве основного алгоритма сжатия для
initramfs, нам следует отредактировать конфигурационный файл
``/etc/mkinitcpio.conf`` и добавить в него следующие строчки:

.. code-block:: shell
  :caption: ``/etc/mkinitcpio.conf``

   COMPRESSION="lz4"
   COMPRESSION_OPTIONS=(-9)

Не забываем обновить все образы initramfs после проделанных
изменений::

  sudo mkinitcpio -P

.. index:: startup-acceleration, hdd, ssd, systemd, mkinitcpio
.. _speed-up-systemd-startup:

--------------------------------------------
Ускорение загрузки системы c помощью systemd
--------------------------------------------

Есть ещё способ ускорить загрузку системы, используя систему
инициализации systemd, указав её использование на самом раннем этапе
загрузки ядра внутри initramfs окружения. Для этого нужно убрать
``base`` и ``udev`` из массива ``HOOKS`` в файле
``/etc/mkinitcpio.conf``, и заменить их на ``systemd`` чтобы он
выглядел примерно так:

.. code-block:: shell
   :caption: sudo nano /etc/mkinitcpio.conf

    HOOKS=(systemd autodetect microcode modconf kms keyboard sd-vconsole block filesystems fsck)

.. warning:: Для систем с зашифрованным корневым разделом к
   представленному перечню хуков вам также следует добавить
   ``sd-encrypt`` через пробел сразу после хука ``sd-vconsole``.

Это немного увеличит образ initramfs, но заметно может ускорить запуск
системы на пару секунд.

Не забываем обновить все образы initramfs после проделанных
изменений::

  sudo mkinitcpio -P

.. vim:set textwidth=70:
