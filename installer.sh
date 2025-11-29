#!/bin/bash

# Имя каталога вашего сайта. Измените его, если хотите другое.
SITE_NAME="my_php_website"
WEB_ROOT="/var/www/html/$SITE_NAME"
PHP_VERSION="8.1" # Версия PHP по умолчанию для Ubuntu 22.04

# --- 1. Обновление системы и установка пакетов ---
echo "⚙️ Обновление списка пакетов и установка Nginx, PHP и MySQL..."
sudo apt update
sudo apt install -y nginx php${PHP_VERSION}-fpm php${PHP_VERSION}-mysql php${PHP_VERSION}-cli php${PHP_VERSION}-curl php${PHP_VERSION}-gd php${PHP_VERSION}-mbstring php${PHP_VERSION}-xml php${PHP_VERSION}-zip mysql-server

# --- 2. Настройка Nginx ---

# Создание каталога для сайта
echo "📁 Создание корневого каталога сайта: $WEB_ROOT"
sudo mkdir -p $WEB_ROOT
sudo chown -R www-data:www-data $WEB_ROOT
sudo chmod -R 755 $WEB_ROOT

# Создание простого тестового PHP-файла
echo "<?php
echo '<h1>Успех! Ваш PHP-сайт на Nginx работает!</h1>';
echo '<p>Версия PHP: ' . phpversion() . '</p>';
?>" | sudo tee $WEB_ROOT/index.php > /dev/null

# Создание конфигурационного файла Nginx для нового сайта
NGINX_CONF="/etc/nginx/sites-available/$SITE_NAME"
echo "📝 Создание конфигурации Nginx..."
sudo bash -c "cat <<EOF > $NGINX_CONF
server {
    listen 80;
    server_name _; # Используем '_' для настройки по умолчанию по IP

    root $WEB_ROOT;
    index index.php index.html index.htm;

    location / {
        try_files \$uri \$uri/ =404;
    }

    # Pass PHP scripts to FPM
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php${PHP_VERSION}-fpm.sock;
    }
}
EOF"

# Включение конфигурации (создание символической ссылки)
echo "🔗 Активация сайта и удаление дефолтного конфига Nginx..."
sudo ln -s $NGINX_CONF /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации Nginx и перезапуск
echo "♻️ Проверка и перезапуск Nginx..."
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# --- 3. Настройка MySQL (БЕЗ установки пароля!) ---
echo "⚠️ **Внимание:** MySQL установлен, но не защищен! Запустите 'sudo mysql_secure_installation' для установки пароля и защиты."
sudo systemctl start mysql
sudo systemctl enable mysql

# --- 4. Завершение ---
echo "✅ **Установка завершена!**"
echo "---------------------------------------------------------"
echo "🌐 Ваш веб-сервер LEMP (Nginx, MySQL, PHP) готов."
echo "---------------------------------------------------------"
