.. ARU (c) 2018 - 2022, Pavel Priluckiy, Vasiliy Stelmachenok and contributors

   ARU is licensed under a
   Creative Commons Attribution-ShareAlike 4.0 International License.

   You should have received a copy of the license along with this
   work. If not, see <https://creativecommons.org/licenses/by-sa/4.0/>.

""""""""""""""""""""""""
Полезное ПО
""""""""""""""""""""""""

.. contents:: Содержание:
  :depth: 2

.. role:: bash(code)
  :language: shell

Программы разного назначения, однако могут быть полезными.

===========
Stacer
===========

Помощник в обслуживании и чистке системы.

.. image:: images/generic-system-acceleration-3.png

**Установка**::

  git clone https://aur.archlinux.org/stacer.git # Скачивание исходников. 
  cd stacer                                      # Переход в stacer. 
  makepkg -sric                                  # Сборка и установка.

===============
Bleachbit
===============

Аналог CCleaner для Linux, помогает выполнить очистку системы от накопившегося в ней мусора.

Советуем выполнять чистку системы уже после проведения всех оптимизаций.

.. image:: images/generic-system-acceleration-4.png

**Установка + дополнительные фильтры**::

  sudo pacman S bleachbit

  # Дополнительные фильтры

  git clone https://aur.archlinux.org/cleanerml-git.git # Загрузка исходников.
  cd cleanerml-git                                      # Переход в cleanerm.
  makepkg -sric                                         # Сборка и установка.

========
Piper
========

Позволяет выполнить более тонкую настройку вашей мышки, в том числе переназначить DPI, настроить подсветку и собственные действия на дополнительные кнопки.

.. image:: https://raw.githubusercontent.com/libratbag/piper/wiki/screenshots/piper-resolutionpage.png

**Установка** ::

  sudo pacman -S piper

.. attention:: Поддерживаются только некоторые из моделей мышек от Logitech/Razer/Steelseries.
   Полный список поддерживаемых устройств вы можете найти по ссылке:

   https://github.com/libratbag/libratbag/wiki/Devices

==========
pam_usb
==========

Позволяет сделать из вашей USB-флешки ключ для авторизации в вашу систему.
Совместим с экранными менеджерами входа GDM и KDM.

Существует несколько режимов работы:

1. Использовать флешку вместо пароля, при условии её подключения (если подключение отсутствует - нужно вводить пароль)
2. Требовать наличие подключенного USB-носителя вместе с вводом пароля.

**Установка** ::

  git clone https://github.com/mcdope/pam_usb.git
  cd pam_usb/arch_linux
  makepkg -sric

**P.S.** Данная программа не совсем согласуется с тематикой руководства, но будем считать данный подраздел исключением куда можно разместить любое ПО.
Главное - чтобы оно было действительно полезным.

========
Bottles
========

Удобный менеджер по управлению бутылками (префиксами) в Wine. Альтернатива Lutris, имеет приятный и понятный интерфейс,
возможность графической установки зависимостей (DLL библиотек) и поддерживает изоляцию из коробки.

**Демонстрация**

1. Окно выбора бутылки

.. image:: images/generic-system-acceleration-5.png

2. Создание новой бутылки

.. image:: images/generic-system-acceleration-6.png

3. Управление бутылкой

.. image:: images/generic-system-acceleration-7.png

4. Установка зависимостей (DLL библиотек)

.. image:: images/generic-system-acceleration-8.png

**Установка** ::

  git clone https://aur.archlinux.org/bottles.git # Скачиваем исходники
  cd bottles                                      # Переход в директорию
  makepkg -sric                                   # Сборка и установка

=============================
Мониторинг FPS в играх.
=============================

-------------------
Mangohud
-------------------

Включение мониторинга в играх как в MSI Afterburner.

.. image:: https://raw.githubusercontent.com/ventureoo/ARU/main/archive/ARU/images/image9.png
  :align: center

**Установка** ::

  cd tools                                             # Переход в заранее созданную папку в домашнем каталоге.
  git clone https://aur.archlinux.org/mangohud.git     # Скачивание исходников.
  cd mangohud                                          # Переход в mangohud.
  makepkg -sric                                        # Сборка и установка.

Графический помощник для настройки вашего MangoHud. ::

  cd tools                                         # Переход в заранее созданную папку в домашнем каталоге.
  git clone https://aur.archlinux.org/goverlay.git # Скачивание исходников.
  cd goverlay                                      # Переход в goverlay-bin
  makepkg -sric                                    # Сборка и установка.

**Подробней в видео.**

https://www.youtube.com/watch?v=4RqerevPD4I

--------------------------------------------------------------------------
Альтернатива: DXVK Hud (*Только для игр запускаемых через Wine/Proton*)
--------------------------------------------------------------------------

Вы также можете использовать встроенную в DXVK альтернативу для мониторинга - DXVK Hud.
Он не такой гибкий как MangoHud, но также способен выводить значения FPS, график времени кадра, нагрузку на GPU.
Использовать данный HUD можно задав переменную окружения *DXVK_HUD*.
К примеру, :bash:`DXVK_HUD=fps,frametimes,gpuload` выводит информацию о FPS, времени кадра, и нагрузке на GPU.

Полный список значений переменной вы можете узнать - `здесь <https://github.com/doitsujin/dxvk#hud>`_.
