""""""""""""""""""""""""
Мониторинг FPS в играх.
""""""""""""""""""""""""

.. contents:: Содержание:
  :depth: 2

.. role:: bash(code)
  :language: bash

Включения мониторинга в играх, как в MSI Afterburner.

.. image:: https://raw.githubusercontent.com/ventureoo/ARU/main/archive/ARU/images/image9.png
  :align: center

**Установка**

.. code:: bash

  cd tools                                             # Переход в заранее созданную папку в домашнем каталоге.
  git clone https://aur.archlinux.org/mangohud.git     # Скачивание исходников.
  cd mangohud                                          # Переход в mangohud.
  makepkg -sric                                        # Сборка и установка.

Графический помощник для настройки вашего MangoHud.

.. code:: bash

  cd tools                                         # Переход в заранее созданную папку в домашнем каталоге.
  git clone https://aur.archlinux.org/goverlay.git # Скачивание исходников.
  cd goverlay                                      # Переход в goverlay-bin
  makepkg -sric                                    # Сборка и установка.

**Подробней в видео.**

https://www.youtube.com/watch?v=4RqerevPD4I

=======================================================================
Альтернатива: DXVK Hud (*Только для игр запускаемых через Wine/Proton*)
=======================================================================

Вы также можете использовать встроенную в DXVK альтернативу для мониторинга - DXVK Hud.
Он не такой гибкий как MangoHud, но также способен выводить значения FPS, график времени кадра, нагрузку на GPU.
Использовать данный HUD можно задав переменную окружения *DXVK_HUD*. К примеру, :bash:`DXVK_HUD=fps,frametimes,gpuload` выведет информацию о FPS, времени кадра, и нагрузке на GPU.

Полный список значений переменной вы можете узнать - `здесь <https://github.com/doitsujin/dxvk#hud>`_.
