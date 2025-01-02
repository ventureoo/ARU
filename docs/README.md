# Инструкция по сборке ARU

## Создание нового окружения

Перед началом работы нужно зайти в директорию ``docs/``, после чего создать
новое виртуальное окружение для установки всех необходимых Python
зависимостей:

```
python -m venv aru
```

Где ``aru`` в конце - это имя директории для создания нового окружения. Оно
может быть любым, главное чтобы не конфликтовало с уже имеющимися директориями
из репозитория.

## Переход в новое виртуальное окружение

После чего необходимо перейти в окружение. Если у вас Bash или Zsh:

```
source aru/bin/activate
```

Если Fish, то:

```
source aru/bin/activate.fish
```

## Установка зависимостей

После попадания в виртуальное окружение необходимо установить все зависимости
из файла ``requirements.txt``:

```
pip install -r requirements.txt
```

## Сборка в HTML

После установки зависимостей можно выполнить "сборку" документа в единый набор
HTML страниц. Чтобы это сделать нужно воспользоваться утилитой ``make`` с
указанием соответствующей цели:

```
make html
```

Во время сборки обращайте внимание на различные ошибки, часть из них может быть
критичной, другие могут просто отмечать проблемы в оформлении.

После окончания процесса сборки в директории ``build/html`` можно будет найти
все собранные страницы.

## Сборка в PDF

ARU может быть собран также в единый PDF документ, удобный с точки зрения
переносимости и хранения. Для сборки в PDF нужно предварительно установить
набор пакетов ``latex``, а также измените цель с ``html`` на ``pdf``:

```
make pdf
```