.. ARU (c) 2018 - 2022, Pavel Priluckiy, Vasiliy Stelmachenok and contributors

   ARU is licensed under a
   Creative Commons Attribution-ShareAlike 4.0 International License.

   You should have received a copy of the license along with this
   work. If not, see <https://creativecommons.org/licenses/by-sa/4.0/>.

.. _useful-programs:

************************
Полезные программы
************************

Программы разного назначения, однако могут быть полезными.

.. index:: useful-programs, bleachbit, garbage-removal
.. _bleachbit:

===============
Bleachbit
===============

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

.. index:: useful-programs, mouse, settings
.. _paper:

========
Piper
========

Позволяет выполнить более тонкую настройку вашей мышки, в том числе
переназначить DPI, настроить подсветку и собственные действия на дополнительные
кнопки.

.. image:: https://raw.githubusercontent.com/libratbag/piper/wiki/screenshots/piper-resolutionpage.png

**Установка** ::

  sudo pacman -S piper

.. attention:: Поддерживаются только некоторые из моделей мышек от Logitech/Razer/Steelseries.
   Полный список поддерживаемых устройств вы можете найти по ссылке:

   https://github.com/libratbag/libratbag/wiki/Devices

.. index:: useful-programs, usb, security
.. _pam-usb:

==========
pam_usb
==========

Позволяет сделать из вашей USB-флешки ключ для авторизации в вашу систему.
Совместим с экранными менеджерами входа GDM и KDM.

Существует несколько режимов работы:

1. Использовать флешку вместо пароля, при условии её подключения (если
   подключение отсутствует - нужно вводить пароль)

2. Требовать наличие подключенного USB-носителя вместе с вводом пароля.

**Установка** ::

  git clone https://github.com/mcdope/pam_usb.git
  cd pam_usb/arch_linux
  mv PKGBUILD_stable PKGBUILD
  makepkg -sric

.. vim:set textwidth=70:
