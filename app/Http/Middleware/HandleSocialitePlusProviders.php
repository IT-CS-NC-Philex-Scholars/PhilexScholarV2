<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleSocialitePlusProviders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $socialitePlusConfig = config('socialiteplus');

        // Provide sensible defaults if the config is not fully set up or missing
        if (is_null($socialitePlusConfig)) {
            $socialitePlusConfig = [
                'disable_credentials_login' => false,
                'button_text' => '{provider}',
                'providers' => [],
            ];
        }

        $disableCredentialsLogin = $socialitePlusConfig['disable_credentials_login'] ?? false;
        $buttonText = $socialitePlusConfig['button_text'] ?? '{provider}'; // Default button text
        $allConfiguredProviders = collect($socialitePlusConfig['providers'] ?? []);

        $activeProviders = $allConfiguredProviders->filter(function ($providerDetails) {
            // Ensure providerDetails is an array and has 'active' and 'name' keys
            return is_array($providerDetails) && !empty($providerDetails['active']) && !empty($providerDetails['name']);
        })->map(function ($providerDetails) {
            $name = $providerDetails['name']; // 'name' is confirmed to exist by the filter
            return [
                'name' => $name,
                'icon' => $providerDetails['icon'] ?? '', // Default icon if not set
                'branded' => $providerDetails['branded'] ?? false, // Pass the branded flag
            ];
        })->values()->toArray(); // ->values() to ensure array keys are re-indexed from 0

        $finalProvidersConfig = [
            'button_text' => $buttonText,
            'providers' => $activeProviders,
            'disable_credentials_login' => $disableCredentialsLogin,
        ];

        $request->attributes->set('providersConfig', $finalProvidersConfig);

        return $next($request);
    }
}
