<?php

return [
    'paths' => ['api/*', 'proposalform', '*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000'], // Only allow requests from your frontend origin
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // Enable credentials
];



