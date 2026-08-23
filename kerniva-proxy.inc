# Shared proxy settings for /try/api/* locations. proxy_http_version 1.1; proxy_set_header Host
$host; proxy_set_header X-Forwarded-Proto https; proxy_set_header X-Forwarded-For
$proxy_add_x_forwarded_for; proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
proxy_read_timeout 180s; proxy_buffering off; client_max_body_size 12m;
