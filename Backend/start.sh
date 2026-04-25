#!/bin/sh

# Run migrations (crucial for first deployment)
php artisan migrate --force

# Optimize Laravel for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start the web server
# NOTE: For the REVERB service on Render, you will override this command
# in the Render dashboard (see Step 4).
php -S 0.0.0.0:$PORT -t public
