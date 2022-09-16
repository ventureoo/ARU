.. ARU (c) 2018 - 2022, Pavel Priluckiy, Vasiliy Stelmachenok and contributors

   ARU is licensed under a
   Creative Commons Attribution-ShareAlike 4.0 International License.

   You should have received a copy of the license along with this
   work. If not, see <https://creativecommons.org/licenses/by-sa/4.0/>.

.. index:: mini-kernel, modprobed-db, kernel, modules
.. _mini-kernel:

***********************************
Сборка мини-ядра, и с чем это едят.
***********************************

Ядра, что мы скомпилировали выше уже дают существенное повышение
производительности системы, однако мы еще выжали не все соки. По умолчанию ядра
собираются для универсального применения на разном оборудовании, т.е. с
наличием различных модулей и драйверов для всякого рода периферии и железа,
которого у вас могло никогда и не быть.

*Мини-ядро* - Это Linux ядро собранное с минимальным количеством
модулей/драйверов необходимых для работоспособности вашего железа.

Плюсы: `Значительное сокращение времени на сборку ядра
<https://wiki.archlinux.org/index.php/Modprobed-db#Benefits_of_modprobed-db_with_"make_localmodconfig"_in_custom_kernels>`_,
уменьшение размера ядра, повышение производительности.

Минусы: Невозможность использования нового оборудования или портов без
повторной пересборки ядра.

Чтобы собрать мини-ядро, нам нужно:

Установить `modprobed-db <https://aur.archlinux.org/packages/modprobed-db/>`_
по аналогии с другими AUR пакетами.

После установки выполнить::

  systemctl --user enable --now modprobed-db.service # Это демон для индексирования активно используемых системой модулей ядра
  sudo modprobed-db recall # Сделает дамп используемых системой модулей ядра.

Далее, активно используем всю периферию и железки, что у вас есть пока не
соберется достаточное количество модулей (Примерно 2-3 дня активного
пользования системой).

После того как все приготовления сделаны, просто собираем ядро как было указано
выше, но перед сборкой (*makepkg -si*) нужно отредактировать PKGBUILD::

  nano PKGBUILD

И меняем значение этой строки (работает почти для любых ядер): *_localmodcfg=y*

Все, теперь собираем мини-ядро по аналогии с обычным.

*P.S.* Если при сборке образов уже скомпилированного ядра выдает ошибку с
указанием на отсутствующие модули, что-то в формате: db_xxx, bd_xxx - просто
пропишите их в ручную::

  sudo nano ~/.config/modprobed.db

Затем выполните::

  sudo modprobed-db store
  sudo modprobed-db recall

И снова пересоберите ядро.

**Видео версия**

https://www.youtube.com/watch?v=8GRNN94afyg

.. index:: mini-kernel, problems, modules, modprobed-db
.. _related-issues:

==============================================================
Возможные часто встречаемые проблемы после установки мини-ядра
==============================================================

**П:** Система не загружается дальше rootfs (частая проблема).

**Р:** Обычно это означает, что какие-то системно-важные модули не были
"подхвачены" modprobed-db. Почти всегда дело заключается в модулях на поддержку
SATA/SCSI, либо ATA и модулей Файловых систем.

Вот список модулей, из-за отсутствия которых может не грузиться система:

- scsi_mod
- sd_mod
- libahci
- libata
- lzo_rle
- efi_pstore
- evdev
- ext4
- btrfs
- ahci
- autofs4
- fuse
- dm_cache
- dm_cache_smq
- dm_mirror
- dm_mod
- dm_snapshot
- dm_thin_pool

Чтобы это исправить просто добавьте эти модули вручную, т.е. отредактировав
файл по пути ``sudo nano ~/.config/modprobed.db``. Затем снова пересоберите
мини-ядро как это показано в предыдущем разделе, после пересборки мини-ядро
должно загрузиться.

**П:** После установки мини-ядра отсутствует интернет-подключение.

**Р1:** Обычно это вызвано отсутствием модулей драйвера для сетевой карты, либо
отсутствием важных системных модулей для корректной работы интернет
подключения. Вот список модулей, из-за которых возможно не работает сеть:

- 8021q
- af_packet
- af_alg
- alx
- ecdh_generic
- garp
- libphy
- r8169
- rc_core
- realtek
- sch_fq_codel
- llc

Так же, как и в случае с прошлой проблемой, просто пропишите эти модули в
ручную, т.е. отредактируйте ``sudo nano ~/.config/modprobed.db``. Обратите
внимание, что модуль драйвера для сетевой карты у каждого может быть разный, и
перед тем как прописать какой-либо модуль драйвера, лучше посмотреть в рабочей
системе (*lspci -v*) какой именно нужен вашей сетевой карте, и прописать его.
После этого, в очередной раз, пересоберите мини-ядро.

**Р2:** Если нет подключения, а вывод команды:

journalctl -b | grep "NetworkManager"

сообщает об ошибке *dhcp4* и *l2_packet_init*, то необходимо пересобрать мини-ядро, добавив параметр в *makenconfig*::

[*] Networking support  ---> 
      Networking options  ---> 
        <*> Packet socket

**П:** После перезагрузки драйвер NVIDIA загружается, но вместо него
используется llvmpipe.

**Р:** Укажите точный путь до модулей драйвера в ваших настройках Xorg, т.е.
пропишите в */etc/X11/xorg.conf* следующее::

  Section "Files"
    ModulePath "/usr/lib/nvidia/xorg"
    ModulePath "/usr/lib/xorg/modules"
  EndSection

Затем перезагрузитесь.

**П:** Не монтируется раздел /boot/, однако можно зайти в систему введя пароль root::

[FALIED] Failed to mount /boot
[DEPEND] Dependency failed for Local File Systems.
  You are in emergency mode. After logging in, type "journalctl -xb" to view system logs, "systemctl reboot" to reboot, "systemctl default" or "exit" to boot into default mode
  Dlya prodolzheniya vvedite parol` root    (Если установлен русский язык, либо что-то похожее про root)

**Р:** Если для раздела используется файловая система FAT/VFAT, введя пароль root, необходимо ввести:: 
  
  dmesg | grep FAT

Если в выводе будет::

  FAT-fs (sdx1): codepage cp437 not found

То необходимо пересобрать мини-ядро, предварительно проверив наличие следующих параметров в *makenconfig*::

File Systems --->
  Native language support --->
    <*> Codepage 437 (United States, Canada)
    <*> ASCII
    <*> NLS UTF-8

