# ARU

Это помощник по настройке вашей системы Arch Linux с целью получить
максимальную производительность и настроить систему для комфортной игры. Здесь
вы также можете найти руководства по оптимизации DE (рабочих окружений):
GNOME/KDE/Cinnamon и немного для Xfce. Проект не претендует на замену Arch
Wiki, он лишь является практическим руководством, написанным на основе личного
опыта его авторов.

Данный репозиторий является зеркалом, а ныне и основным хранилищем одноименного
руководства из Google Docs.

## О двух репозиториях

Изначально проект был размещен на GitHub, но в какой-то момент переехал на Codeberg и
ныне там развивается. Тем не менее репозиторий на GitHub никуда не делся и
является по сути просто зеркалом для Codeberg. Если вы хотите внести вклад в
проект, то лучше всего отправлять изменения в репозиторий Codeberg. Домен
https://ventureoo.github.io/ARU сохранен и переадресует вас на актуальный адрес.

## Содержание

- [Предисловие](https://ventureo.codeberg.page/source/preface.html)
- [Первые шаги](https://ventureo.codeberg.page/source/first-steps.html)
- [Базовое ускорение системы](https://ventureo.codeberg.page/source/generic-system-acceleration.html)
- [Экстра оптимизации](https://ventureo.codeberg.page/source/extra-optimizations.html)
- [Обновление параметров ядра](https://ventureo.codeberg.page/source/kernel-parameters.html)
- [Оптимизация файловой системы](https://ventureo.codeberg.page/source/file-systems.html)
- [Кастомные ядра для увеличения плавности](https://ventureo.codeberg.page/source/custom-kernels.html)
- [Linux Gaming](https://ventureo.codeberg.page/source/linux-gaming.html)
- [Сборка мини-ядра](https://ventureo.codeberg.page/source/mini-kernel.html)
- [Оптимизация рабочего окружения (GNOME/Plasma/Xfce/Cinnamon)](https://ventureo.codeberg.page/source/de-optimizations.html)
- [Полезные программы](https://ventureo.codeberg.page/source/useful-programs.html)

## Благодарности

Основной вклад в проект был внесен этими людьми:

- [Павел Прилуцкий](https://vk.com/ustavchiy) (@Almarus) - Автор оригинального документа

- [Василий Стельмачёнок](https://vk.com/ventureo) (@ventureo) - Текущий сопровождающий проекта, редактор и соавтор. 

Отдельное спасибо этим людям за их указания на ошибки/опечатки:
 
- [@dewdpol](https://github.com/dewdpol) (https://codeberg.org/ventureo/ARU/pulls/51, https://codeberg.org/ventureo/ARU/pulls/48)

- [@holydrug](https://github.com/holydrug)

- [@xtrahigh](https://github.com/xtrahigh) (https://codeberg.org/ventureo/ARU/pulls/36)

- [@Atmosphelen](https://github.com/Atmosphelen) (https://codeberg.org/ventureo/ARU/pulls/66, https://codeberg.org/ventureo/ARU/pulls/67)

- [@Vochatrak-az-ezm](https://github.com/Vochatrak-az-ezm) (https://codeberg.org/ventureo/ARU/issues/72)

- [@QTaKs](https://codeberg.org/QTaKs) (https://codeberg.org/ventureo/ARU/issues/81, https://codeberg.org/ventureo/ARU/issues/82)

- [@un-couteau](https://vk.com/kukuruz2222)

- [@vellynproduction](https://codeberg.org/vellynproduction) (https://codeberg.org/ventureo/ARU/issues/92)

## Как я могу внести свой вклад в проект?

Проект на текущий момент не в самой активной фазе своего развития, но я все ещё
готов принять любые правки для улучшения качества написанного материала или
добавления новых разделов. Пожалуйста, если вы хотите внести свой вклад, то
прежде всего:

1) Откройте задачу в нашем репозитории Codeberg (https://codeberg.org/ventureo/ARU, требуется регистрация)
2) Либо же Создайте Pull Request и отправьте его в наш репозторий Codeberg/GitHub.

Если вы выберите второй вариант, то для написания нового материала вам нужно
уметь работать с файлами формата ReStructuredText (ReST). Именно в нем написаны
все разделы которые вы можете найти в ``docs/source/``. Я рекомендую вам
изучить следующие материалы прежде чем начинать вносить свои правки:

https://restructuredtext.ru/

https://sphinx-ru.readthedocs.io/ru/latest/sphinx.html

Самым простым путем для внесения правок в ARU, так сказать для "чайников" в Git,
будет редактирование через Web интерфейс на GitHub или Codeberg. Там же вы
можете проверить свои изменения на корректность и правильность.

Только после рассмотрения автором правок и их слияния они станут доступны в веб
версии ARU (https://ventureo.codeberg.page/).
