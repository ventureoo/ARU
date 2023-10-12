.. ARU (c) 2018 - 2022, Pavel Priluckiy, Vasiliy Stelmachenok and contributors

   ARU is licensed under a
   Creative Commons Attribution-ShareAlike 4.0 International License.

   You should have received a copy of the license along with this
   work. If not, see <https://creativecommons.org/licenses/by-sa/4.0/>.

****************
Разгон монитора
****************

.. index:: monitor, overlocking, refresh-rate
.. _monitor-overlocking:

==================================================
Разгон монитора и исправление цветового диапозона
==================================================

В этом разделе мы опишем новый способ разгона монитора, который
является более универсальным чем предыдущий через различные
манипуляции с конфигом Xorg.

Суть способа состоит в редактировании EDID файла вашего монитора, что
позволяет этому способу работать на любой конфигурации.

Для начала найдем нужный нам EDID файл через команду::

   find /sys/devices/pci*/ -name edid

.. warning:: Вывод команды может быть пуст для пользователей NVIDIA
   если вы не включили DRM KMS. Чтобы его включить `смотрите
   предыдущие разделы
   <https://ventureo.codeberg.page/source/first-steps.html#nvidia-tweaking>`_

Команда выведет список EDID файлов для различных типов подключения, вы
должны выбрать нужный вам и скопировать его в домашнюю директорию.
Например мне нужен EDID файл для моего монитора который подключен по
HDMI, значит::

  cp -r /sys/devices/pci0000:00/0000:00:01.0/0000:01:00.0/drm/card0/card0-HDMI-A-1/edid ~/

Отлично, теперь выполним установку редактора EDID. В нашем случае это
будет нативный wxedid из AUR, но вы можете воспользоваться любым
другим. ::

  git clone https://aur.archlinux.org/wxedid.git # Стянуть исходники ПО
  cd wxedid                                      # Переходим в директорию
  makepkg -sric                                  # Сборка и установка

Откроем редактор через меню или команду::

  wxedid

После запуска редактора в контекстном меню выбираем **File -> Open EDID
binary** для редактирования нашего EDID файла в домашней директории.

Теперь, для активации полного цветового диапазона меняем данные в строках:

1) SPF: Supported features -> изменить значение vsig_format на 0b00
2) CHD: CEA-861 header -> изменить значение YCbCr4:2:2 и YCbCr4:4:4 на 0
3) VSD: Vendor Specific Data Block -> изменить значение DC_Y444 на 0

Это необходимо чтобы исправить давнюю проблему с неверно выставляемым
в Linux цветовым диапозоном вашего монитора.

.. warning:: У Mutter начиная с версии GNOME 45 появилась поддержка форматов
   YUV (https://gitlab.gnome.org/GNOME/mutter/-/merge_requests/2191), поэтому
   пользователи этого окружения могут пропустить данные шаги.

.. image:: images/wxedid-fullrgb.png

Для разгона же вам нужно выбрать *DTD: Detailed Timing Descriptor*. У
вас их может быть несколько, т.к. каждый из них работает для
отдельного разрешения монитора. Вам нужно выбрать тот, у которого
самое большое разрешение. Вы это поймете по строчкам *H-Active pix* и
*V-Active lines*. После этого перейдите во вкладку *DTD Constructor* и
постепенно увеличиваете значение *Pixel Clock* до нужной вам частоты
монитора.

.. image:: images/wxedid-pixel-clock.png

В контекстном меню сохраняем изменения (*File-> Save EDID Binary*) и
выходим из редактора.

Дело осталось за малым, нужно подменить используемый ядром EDID файл.

.. warning:: Следующие шаги нужно пропустить если вы используете
   закрытый драйвер NVIDIA. Читайте далее.

Скопируем модифицированный файл из нашей домашней директории в
``/usr/lib/firmware/edid``::

  sudo mkdir -p /usr/lib/firmware/edid
  sudo cp -r ~/*.bin /usr/lib/firmware/edid/edid2.bin

Теперь добавим параметр ядра ``drm.edid_firmware=edid/edid2.bin``
чтобы за место обычного EDID файла использовался наш. Для GRUB это
можно сделать или вручную через редатирование файла
``/etc/default/grub``, или через grub-customizer как показано ниже.
После этого не забываем сохранить изменения через кнопку *"Сохранить"*
в левом углу ПО или командой ``sudo grub-mkconfig -o
/boot/grub/grub.cfg`` если вы предпочли делать все вручную.


.. image:: images/grub-customizer-edid.png

Однако, если у вас ноутбук, то дополнительно нужно добавить файл
``/usr/lib/firmware/edid/edid2.bin`` в образы initramfs. Для этого
редактируем файл ``/etc/mkinitcpio.conf`` и в строке FILES=() пишем
следующее::

  FILES=(/usr/lib/firmware/edid/edid2.bin)

После чего обновляем образы initramfs через команду ``sudo mkinitcpio
-P``.

Затем перезагружаемся и наслаждаемся новой плавностью картинки.

.. warning:: Если вы используете закрытый драйвера NVIDIA, то параметр
   ядра ``drm.edid_firmware`` для вас просто не будет работать. Вместо
   него вы должны прописать параметр ``Option "CustomEDID"
   "HDMI-0:/home/ваше_имя_пользователя/edid.bin"`` (тип подключения
   меняете на требуемый) в ваш конфиг ``/etc/X11/xorg.conf``. Как
   можно понять, при этом разгон не будет работать в Wayland.

**Видео версия**

https://www.youtube.com/watch?v=ax0A9N_2nbw



