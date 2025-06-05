<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Config;
use Inertia\Testing\AssertableInertia as Assert;

// --- Test Scenario 1: Only Facebook Login (Credentials Disabled) ---
describe('Auth Pages: Only Facebook Login (Credentials Disabled)', function (): void {
    $processedFacebookProvider = [
        'name' => 'Facebook',
        'icon' => 'FacebookIcon',
        'branded' => false,
    ];

    beforeEach(function (): void {
        Config::set('socialiteplus', [
            'button_text' => 'Login with {provider}',
            'disable_credentials_login' => true,
            'providers' => [
                'google' => ['active' => false, 'name' => 'Google', 'icon' => 'GoogleIcon', 'branded' => false, 'client_id' => 'test_google_id'],
                'facebook' => ['active' => true, 'name' => 'Facebook', 'icon' => 'FacebookIcon', 'branded' => false, 'client_id' => 'test_fb_id'],
                'github' => ['active' => false, 'name' => 'GitHub', 'icon' => 'GitHubIcon', 'branded' => true, 'client_id' => 'test_github_id'],
            ],
        ]);
    });

    test('login page correctly configured for Facebook-only login', function () use ($processedFacebookProvider): void {
        $this->get(route('login'))
            ->assertOk()
            ->assertInertia(fn (Assert $page): \Illuminate\Testing\Fluent\AssertableJson => $page
                ->component('auth/login-social')
                ->has('providersConfig', function (Assert $config) use ($processedFacebookProvider): void {
                    $config->where('button_text', 'Login with {provider}')
                        ->where('disable_credentials_login', true)
                        ->where('providers', [$processedFacebookProvider])
                        ->count(3); // Ensures only button_text, disable_credentials_login, providers exist
                })
                ->has('canResetPassword') // Example of another top-level prop
                ->etc() // Allow other top-level props not explicitly checked here
            );
    });

    test('register page correctly configured for Facebook-only login', function () use ($processedFacebookProvider): void {
        $this->get(route('register'))
            ->assertOk()
            ->assertInertia(fn (Assert $page): \Illuminate\Testing\Fluent\AssertableJson => $page
                ->component('auth/register-social')
                ->has('providersConfig', function (Assert $config) use ($processedFacebookProvider): void {
                    $config->where('button_text', 'Login with {provider}')
                        ->where('disable_credentials_login', true)
                        ->where('providers', [$processedFacebookProvider])
                        ->count(3);
                })
                ->etc()
            );
    });
});

// --- Test Scenario 2: Credential Login AND Multiple Social Logins Enabled ---
describe('Auth Pages: Credentials and Multiple Social Logins Enabled', function (): void {
    $processedFacebookProvider = [
        'name' => 'Facebook',
        'icon' => 'FacebookIcon',
        'branded' => false,
    ];
    $processedGithubProvider = [
        'name' => 'GitHub',
        'icon' => 'GitHubIcon',
        'branded' => true,
    ];

    beforeEach(function (): void {
        Config::set('socialiteplus', [
            'button_text' => 'Sign in via {provider}',
            'disable_credentials_login' => false,
            'providers' => [
                'google' => ['active' => false, 'name' => 'Google', 'icon' => 'GoogleIcon', 'branded' => false],
                'facebook' => ['active' => true, 'name' => 'Facebook', 'icon' => 'FacebookIcon', 'branded' => false],
                'github' => ['active' => true, 'name' => 'GitHub', 'icon' => 'GitHubIcon', 'branded' => true],
            ],
        ]);
    });

    test('login page shows credentials and active social logins', function () use ($processedFacebookProvider, $processedGithubProvider): void {
        $this->get(route('login'))
            ->assertOk()
            ->assertInertia(fn (Assert $page): \Illuminate\Testing\Fluent\AssertableJson => $page
                ->component('auth/login-social')
                ->has('providersConfig', function (Assert $config) use ($processedFacebookProvider, $processedGithubProvider): void {
                    $config->where('button_text', 'Sign in via {provider}')
                        ->where('disable_credentials_login', false)
                        ->where('providers', [
                            $processedFacebookProvider,
                            $processedGithubProvider,
                        ])
                        ->count(3);
                })
                ->etc()
            );
    });

    test('register page shows credentials and active social logins', function () use ($processedFacebookProvider, $processedGithubProvider): void {
        $this->get(route('register'))
            ->assertOk()
            ->assertInertia(fn (Assert $page): \Illuminate\Testing\Fluent\AssertableJson => $page
                ->component('auth/register-social')
                ->has('providersConfig', function (Assert $config) use ($processedFacebookProvider, $processedGithubProvider): void {
                    $config->where('button_text', 'Sign in via {provider}')
                        ->where('disable_credentials_login', false)
                        ->where('providers', [
                            $processedFacebookProvider,
                            $processedGithubProvider,
                        ])
                        ->count(3);
                })
                ->etc()
            );
    });
});

// --- Test Scenario 3: Credentials Disabled AND NO Social Providers Active ---
describe('Auth Pages: Credentials Disabled and No Social Providers Active', function (): void {
    beforeEach(function (): void {
        Config::set('socialiteplus', [
            'button_text' => 'Use {provider}',
            'disable_credentials_login' => true,
            'providers' => [
                'google' => ['active' => false, 'name' => 'Google', 'icon' => 'GoogleIcon', 'branded' => false],
                'facebook' => ['active' => false, 'name' => 'Facebook', 'icon' => 'FacebookIcon', 'branded' => false],
            ],
        ]);
    });

    test('login page correctly configured when no methods available', function (): void {
        $this->get(route('login'))
            ->assertOk()
            ->assertInertia(fn (Assert $page): \Illuminate\Testing\Fluent\AssertableJson => $page
                ->component('auth/login-social')
                ->has('providersConfig', function (Assert $config): void {
                    $config->where('button_text', 'Use {provider}')
                        ->where('disable_credentials_login', true)
                        ->where('providers', [])
                        ->count(3);
                })
                ->etc()
            );
    });

    test('register page correctly configured when no methods available', function (): void {
        $this->get(route('register'))
            ->assertOk()
            ->assertInertia(fn (Assert $page): \Illuminate\Testing\Fluent\AssertableJson => $page
                ->component('auth/register-social')
                ->has('providersConfig', function (Assert $config): void {
                    $config->where('button_text', 'Use {provider}')
                        ->where('disable_credentials_login', true)
                        ->where('providers', [])
                        ->count(3);
                })
                ->etc()
            );
    });
});

// --- Test Scenario 4: Only Credential Login (Socials Inactive, Credentials Enabled) ---
describe('Auth Pages: Only Credential Login (Socials Inactive)', function (): void {
    beforeEach(function (): void {
        Config::set('socialiteplus', [
            'button_text' => '{provider} Login',
            'disable_credentials_login' => false,
            'providers' => [
                'facebook' => ['active' => false, 'name' => 'Facebook', 'icon' => 'FacebookIcon', 'branded' => false],
            ],
        ]);
    });

    test('login page correctly configured for credentials-only', function (): void {
        $this->get(route('login'))
            ->assertOk()
            ->assertInertia(fn (Assert $page): \Illuminate\Testing\Fluent\AssertableJson => $page
                ->component('auth/login-social')
                ->has('providersConfig', function (Assert $config): void {
                    $config->where('button_text', '{provider} Login')
                        ->where('disable_credentials_login', false)
                        ->where('providers', [])
                        ->count(3);
                })
                ->etc()
            );
    });

    test('register page correctly configured for credentials-only', function (): void {
        $this->get(route('register'))
            ->assertOk()
            ->assertInertia(fn (Assert $page): \Illuminate\Testing\Fluent\AssertableJson => $page
                ->component('auth/register-social')
                ->has('providersConfig', function (Assert $config): void {
                    $config->where('button_text', '{provider} Login')
                        ->where('disable_credentials_login', false)
                        ->where('providers', [])
                        ->count(3);
                })
                ->etc()
            );
    });
});

// --- Test Scenario 5: SocialitePlus Config Missing/Null (Graceful Degradation) ---
describe('Auth Pages: SocialitePlus Config Missing/Null', function (): void {
    beforeEach(function (): void {
        Config::set('socialiteplus', null); // Simulate config not published or returning null
    });

    test('login page handles missing socialiteplus config gracefully', function (): void {
        $this->get(route('login'))
            ->assertOk()
            ->assertInertia(fn (Assert $page): \Illuminate\Testing\Fluent\AssertableJson => $page
                ->component('auth/login-social')
                ->has('providersConfig', function (Assert $config): void {
                    $config->where('button_text', '{provider}') // Default from middleware
                        ->where('disable_credentials_login', false) // Default from middleware
                        ->where('providers', [])
                        ->count(3); // Ensure these are the only keys
                })
                ->etc()
            );
    });

    test('register page handles missing socialiteplus config gracefully', function (): void {
        $this->get(route('register'))
            ->assertOk()
            ->assertInertia(fn (Assert $page): \Illuminate\Testing\Fluent\AssertableJson => $page
                ->component('auth/register-social')
                ->has('providersConfig', function (Assert $config): void {
                    $config->where('button_text', '{provider}') // Default from middleware
                        ->where('disable_credentials_login', false) // Default from middleware
                        ->where('providers', [])
                        ->count(3); // Ensure these are the only keys
                })
                ->etc()
            );
    });
});
