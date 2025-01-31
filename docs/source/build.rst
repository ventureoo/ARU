.. ARU (c) 2018 - 2024, Pavel Priluckiy, Vasiliy Stelmachenok and contributors

   ARU is licensed under a
   Creative Commons Attribution-ShareAlike 4.0 International License.

   You should have received a copy of the license along with this
   work. If not, see <https://creativecommons.org/licenses/by-sa/4.0/>.

.. _package_optimization:

*******************
Оптимизация пакетов
*******************

.. index:: makepkg-conf, native-compilation, flags, lto
.. _makepkg-conf:

======================
Настройка makepkg.conf
======================

Прежде чем приступать к сборке пакетов, мы должны изменить так
называемые флаги компиляции, что являются указателями для компилятора,
какие инструкции и оптимизации использовать при сборке программ.

Для этого создадим пользовательский конфиг ``~/.makepkg.conf`` в домашней
директории, чтобы переопределить системные настройки:

.. code-block:: shell
  :caption: ``nano ~/.makepkg.conf``

  CFLAGS="-march=native -mtune=native -O2 -pipe -fno-plt -fexceptions \
        -Wp,-D_FORTIFY_SOURCE=3 -Wformat -Werror=format-security \
        -fstack-clash-protection -fcf-protection"
  CXXFLAGS="$CFLAGS -Wp,-D_GLIBCXX_ASSERTIONS"
  RUSTFLAGS="-C opt-level=3 -C target-cpu=native -C link-arg=-z -C link-arg=pack-relative-relocs"
  MAKEFLAGS="-j$(nproc) -l$(nproc)"

.. note:: Где "-O2" - **Это не нуль/ноль**

Данные флаги компилятора выжимают максимум производительности при
компиляции, но могут вызывать ошибки сборки в очень редких
приложениях. Если такое случится, то отключите параметр ‘lto’ в строке
``options`` добавив перед ним символ восклицательного знака  !
(*"!lto"*).

.. index:: makepkg, tmpfs, native-compilation
.. _makepkg_tmpfs:

---------------------------------------
Использование tmpfs для сборки в ОЗУ
---------------------------------------

Во время сборки программ компилируются множество временных
промежуточных файлов и записываются на диск (HDD/SSD) для последующей
компоновки в исполняемый файл или библиотеку. Для ускорения процесса
сборки пакетов можно использовать вместо HDD/SSD - оперативную память,
а точнее *tmpfs*. Поскольку ОЗУ значительно быстрее любого HDD или
SSD, то сборка происходит быстрее. Помимо этого уменьшается нагрузка
на систему ввода-вывода, и как следствие меньше изнашивается диск.
Использовать tmpfs для makepkg можно несколькими способами:

- Непосредственно указывать переменную перед сборкой::
 
   BUILDDIR=/tmp/makepkg makepkg -sric

- Для сборки всего - задать параметр (раскомментировать в файле
  ``/etc/makepkg.conf``) ``BUILDDIR`` для использования директории
  ``/tmp``::

   BUILDDIR=/tmp/makepkg

- Создать отдельную директорию *tmpfs* заданного размера: 
  
  - Необходимо добавить в ``/etc/fstab`` директорию для монтирования
    *tmpfs*, указав путь и максимальный объём директории, которая
    может расширяться при работе *tmpfs* (учтите что *tmpfs*
    использует ОЗУ, поэтому внимательно подходите к вопросу
    выделяемого объема, он не должен превышать общий объем доступной
    памяти, несмотря на то, что изначально *tmpfs* ничего не
    занимает), например::

     tmpfs   /var/tmp/makepkg         tmpfs   rw,nodev,nosuid,size=16G          0  0

  - Далее, как и в предыдущем случае, указать ``BUILDDIR`` в
    ``/etc/makepkg.conf``, но уже с путем к директории указанной в
    *fstab*::
   
     BUILDDIR=/var/tmp/makepkg

.. attention:: На системах с небольшим количеством ОЗУ (например 4 ГБ
   и менее) *tmpfs* может негативно сказаться на сборке тяжёлых
   пакетов, что может привести к недостатку ОЗУ для сборки.

.. note:: Можно указать параметр PKGDEST для определения
   директории собранного пакета.

Количество доступного и используемого места в *tmpfs* можно
посмотреть::

  df -h | grep tmpfs

.. index:: makepkg, ccache, native-compilation
.. _enabling_ccache:

-----------------------
Включение ccache
-----------------------

В Linux системах есть не так много программ, сборка которых может
занять больше двух часов, но они все таки есть. Потому, было бы
неплохо ускорить повторную компиляцию таких программ как
Wine/Proton-GE и т.д.

ccache - это кэш для компиляторов C/C++, в частности совместимый с
компиляторами GCC/Clang, цель которого состоит в ускорении повторного
процесса компиляции одного и того же кода. Это значит, что если при
сборке программы новой версии, будут замечены полностью идентичные
блоки исходного кода в сравнении с его старой версией, то компиляция
этих исходных текстов производиться не будет. Вместо этого, уже
готовый, скомпилированный код старой версии будет вынут из кэша
ccache. За счёт этого и достигается многократное ускорение процесса
компиляции.

**Установка** ::

  sudo pacman -S ccache

После установки его ещё нужно активировать в ваших настройках makepkg.
Для этого отредактируем конфигурационный файл

.. code-block:: shell
   :caption: ``nano ~/.makepkg.conf``

   BUILDENV=(!distcc color ccache check !sign)

После этого повторная пересборка желаемых программ и их обновление
должны значительно ускориться.

.. attention:: ccache может ломать сборку некоторых программ, поэтому
   будьте осторожны с его применением.

.. index:: installation, ananicy, zram, nohang, trim
.. _daemons-and-services:

.. index:: makepkg, clang, native-compilation, flags
.. _force-clang-usage:

======================================================
Форсирование использования Clang при сборке пакетов
======================================================

В системах на базе ядра Linux различают две основных группы
компиляторов, это LLVM и GCC. И те, и другие хорошо справляются с
возложенными на них задачами, но LLVM имеет чуть большее преимущество
с точки зрения производительности при меньших потерях в качестве
конечного кода. Поэтому в целом применение компиляторов LLVM для
сборки различных пакетов при задании флага -O3 (максимальная
производительность) является совершенно оправданным, и может дать
реальный прирост при работе программ.

Компилятором для языков C/C++ в составе LLVM является Clang и Clang++
соответственно. Его использование при сборке пакетов мы и будем
форсировать через makepkg.conf

Для начала выполним их установку::

  sudo pacman -Syu llvm clang lld mold openmp

Теперь клонируем уже готовый конфигурационный файл ``/etc/makepkg.conf``
под новыми именем в домашнюю директорию ``~/.makepkg-clang.conf``::

  cp /etc/makepkg.conf ~/.makepkg-clang.conf

Это поможет нам в случае чего откатиться к использованию компиляторов
GCC если возникнут проблемы со сборкой пакетов через LLVM/Clang.

Теперь откроем выше скопированный файл и добавим туда после строки
``CHOST="x86_64-pc-linux-gnu"`` следующее::

  export CC=clang
  export CXX=clang++
  export AR=llvm-ar
  export NM=llvm-nm
  export STRIP=llvm-strip
  export OBJCOPY=llvm-objcopy
  export OBJDUMP=llvm-objdump
  export READELF=llvm-readelf
  export RANLIB=llvm-ranlib
  export HOSTCC=clang
  export HOSTCXX=clang++
  export HOSTAR=llvm-ar

При использовании Clang из пакета `llvm-git` (установка описана ниже)
стоит установить компоновщик mold, а также другие флаги при сборке
пакетов::

  CFLAGS="-march=native -mtune=native -O3 -falign-functions=32 -fno-math-errno \
          -fno-trapping-math -Wp,-D_FORTIFY_SOURCE=2 -Wformat -Werror=format-security \
          -fstack-clash-protection"
  CXXFLAGS="$CFLAGS -Wp,-D_GLIBCXX_ASSERTIONS"
  LDFLAGS="-fuse-ld=mold -Wl,-O1 -Wl,--sort-common -Wl,--as-needed -Wl,-z,relro -Wl,-z,now \
           -Wl,-z,pack-relative-relocs"
  LTOFLAGS="-flto=auto"
  RUSTFLAGS="-C opt-level=3 -C target-cpu=native -C link-arg=-z -C link-arg=pack-relative-relocs \
             -C link-arg=-fuse-ld=mold"
  #-- Make Flags: change this for DistCC/SMP systems
  MAKEFLAGS="-j$(nproc)"
  NINJAFLAGS="-j$(nproc)"
  OPTIONS=(strip docs !libtool !staticlibs emptydirs zipman purge !debug lto)

Отлично, теперь вы можете собрать нужные вам пакеты (программы) через
LLVM/Clang просто добавив к уже известной команде makepkg следующие
параметры::

  makepkg --config ~/.makepkg-clang.conf -sric --skippgpcheck --skipchecksums

.. attention:: Далеко не все пакеты так уж гладко собираются через
   Clang, в частности не пытайтесь собирать им Wine/DXVK, т.к. это
   официально не поддерживается и с 98% вероятностью приведет к ошибке
   сборки. Но в случае неудачи вы всегда можете использовать
   компиляторы GCC, которые у вас заданы в настройках makepkg.conf по
   умолчанию, т.е. просто уберите опцию ``--config
   ~/.makepkg-clang.conf`` из команды ``makepkg``.

Мы рекомендуем вам пересобрать наиболее важные пакеты. Например такие
как драйвера (то есть `mesa
<https://archlinux.org/packages/extra/x86_64/mesa/>`_, `lib32-mesa
<https://archlinux.org/packages/multilib/x86_64/lib32-mesa/>`_, если у
вас Intel/AMD), `Xorg сервер
<https://archlinux.org/packages/extra/x86_64/xorg-server/>`_, а также
связанные с ним компоненты, или `Wayland
<https://archlinux.org/packages/extra/x86_64/wayland/>`_, критически
важные пакеты вашего DE/WM, например: `gnome-shell
<https://aur.archlinux.org/packages/gnome-shell-performance>`_,
`plasma-desktop
<https://archlinux.org/packages/extra/x86_64/plasma-desktop/>`_. А
также композиторы `kwin
<https://archlinux.org/packages/extra/x86_64/kwin/>`_, `mutter
<https://aur.archlinux.org/packages/mutter-performance>`_, picom и
т.д. в зависимости от того, чем именно вы пользуетесь.

Больше подробностей по теме вы можете найти в данной статье:

https://habr.com/ru/company/ruvds/blog/561286/

.. index:: installation, x86_64_v2, x86_64_v3, alhp, repository, packages
.. _alhp_repository:

====================================
Установка оптимизированных пакетов
====================================

Нативная компиляция - это конечно хорошо, но не у каждого
человека есть время заниматься подобными вещами, да и всю систему
пересобирать с нативными флагами тоже никто не будет (иначе вам сюда:
https://gentoo.org). Возникает вопрос: как сделать все с наименьшим
количеством напряга?

Для начала сделаем небольшое отступление. У архитектуры *x86_64*
различают несколько поколений или "уровней". Это *x86_64*,
*x86_64_v2*, *x86_64_v3* и *x86_64_v4* (новейшие процессоры). Различия
между этими "поколениями" состоят в применяемом наборе инструкций и
возможностей процессора. Например, если вы собираете программу для
x86_64_v2, то вы автоматически задействуете инструкции SSE3, SSE4_1 и
т.д. При этом такая программа не будет работать на предыдущих
поколениях, то есть на процессорах которые не поддерживают набор
инструкций *x86_64_v2*. При этом к *x86_64_v2* и другим уровням
относятся различные процессоры, как AMD, так и Intel. При этом
логично, что чем выше поколение x86_64 поддерживает ваш процессор, тем
больше будет производительность за счет использования многих
оптимизаций и доп. инструкций. Подробнее об этих уровнях или же
поколениях можете прочитать `здесь (англ.)
<https://en.wikipedia.org/wiki/X86-64#Microarchitecture_levels>`__.

Смысл в том, что существует сторонний репозиторий Arch Linux - `ALHP
<https://git.harting.dev/ALHP/ALHP.GO>`__, который содержит **все
пакеты** из официальных репозиториев, но собранных для процессоров
x86_64_v2 или x86_64_v3. То есть это те же самые, уже готовые пакеты
из официальных репозиториев, но собранные с различными оптимизациями
для определенной группы процессоров (поколений x86_64).

.. danger:: Прежде чем мы подключим данный репозиторий, нужно
   **обязательно** понять к какому поколению относиться ваш процессор,
   иначе, если вы установите пакеты собранные для x86_64_v3, но *ваш
   процессор при этом не будет относиться к поколению x86_64_v3*, то
   *ваша система станет полностью не работоспособной*, хотя её и все
   ещё можно будет восстановить через LiveCD окружение при помощи
   pacstrap.

.. danger:: Оптимизированные пакеты для процессоров Intel поддерживают
   только полные процессоры серий Core 2 и i3/i5/i7. Многие процессоры
   Pentium/Celeron не имеют полного набора инструкций, необходимого
   для использования оптимизированных пакетов. Пользователям этих
   процессоров следует установить универсальные пакеты или пакеты
   оптимизированные ниже на один уровень (то есть если у вас
   поддерживается v3, то подключайте репозиторий с v2 и т.д.), даже
   если GCC возвращает значение, соответствующее полному набору флагов
   Core i3/i5/i7, например, Haswell.

Проверить поколение вашего процессора можно следующей командой::

  /lib/ld-linux-x86-64.so.2 --help | grep -B 3 -E "x86-64-v2"

После каждого поколения будет написано, поддерживается оно вашим
процессором или нет. Например::

  Subdirectories of glibc-hwcaps directories, in priority order:
  x86-64-v4
  x86-64-v3
  x86-64-v2 (supported, searched)

Если у вас поддерживается хотя бы x86_64_v2, то вы так же сможете
использовать данный репозиторий, ибо он предоставляет пакеты как для
x86_64_v2, так и для x86_64_v3. **Главное не перепутаете, какое именно у
вас поколение**.

Чтобы подключить репозиторий установим ключи для проверки подписей пакетов::

  # Ключи для пакетов
  git clone https://aur.archlinux.org/alhp-keyring.git
  cd alhp-keyring
  makepkg -sric --skippgpcheck

А также список зеркал::

  git clone https://aur.archlinux.org/alhp-mirrorlist.git
  cd alhp-mirrorlist
  makepkg -sric

После этого нужно отредактировать конфиг pacman добавив репозиторий
для нужной архитектуры (``sudo nano /etc/pacman.conf``).

Итак, **если ваш процессор поддерживает только x86_64_v2** (как
допустим у автора), то пишем следующее::

  [core-x86-64-v2]
  Include = /etc/pacman.d/alhp-mirrorlist

  [extra-x86-64-v2]
  Include = /etc/pacman.d/alhp-mirrorlist

  [multilib-x86-64-v2]
  Include = /etc/pacman.d/alhp-mirrorlist

  [core]
  Include = /etc/pacman.d/mirrorlist

  [extra]
  Include = /etc/pacman.d/mirrorlist

  [multilib]
  Include = /etc/pacman.d/mirrorlist

**Если же у вас процессор поддерживает x86_64_v3**, то пишем следующее::

  [core-x86-64-v3]
  Include = /etc/pacman.d/alhp-mirrorlist

  [extra-x86-64-v3]
  Include = /etc/pacman.d/alhp-mirrorlist

  [multilib-x86-64-v3]
  Include = /etc/pacman.d/alhp-mirrorlist

  [core]
  Include = /etc/pacman.d/mirrorlist

  [extra]
  Include = /etc/pacman.d/mirrorlist

  [multilib]
  Include = /etc/pacman.d/mirrorlist

После этого выполняем полное обновление системы::

  sudo pacman -Syyuu

Перезагружаемся и наслаждаемся результатом (если вы все сделали
правильно).

.. vim:set textwidth=70:
