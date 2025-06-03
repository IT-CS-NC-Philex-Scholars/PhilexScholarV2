import { Head, useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { FormEventHandler } from "react";

import InputError from "@/components/input-error";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";

import SocialitePlus from "@/components/socialite-plus";

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
}

interface SocialRegisterProps {
  providersConfig?: {
    button_text: string;
    providers: { name: string; icon: string; branded: boolean }[];
    disable_credentials_login?: boolean;
  };
}

export default function Login({
  status,
  canResetPassword,
  providersConfig,
}: LoginProps & SocialRegisterProps) {
  const { data, setData, post, processing, errors, reset } = useForm<
    Required<LoginForm>
  >({
    email: "",
    password: "",
    remember: false,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route("login"), {
      onFinish: () => reset("password"),
    });
  };

  const noProvidersAvailable =
    !providersConfig?.providers || providersConfig.providers.length === 0;
  const credentialsDisabled = providersConfig?.disable_credentials_login;

  let layoutTitle = "Log in to your account";
  let layoutDescription = "Enter your email and password below to log in";

  if (credentialsDisabled) {
    if (noProvidersAvailable) {
      layoutTitle = "Login Unavailable";
      layoutDescription =
        "No login methods are currently configured. Please contact an administrator.";
    } else {
      layoutTitle = "Log in with your social account";
      layoutDescription = "Select a provider below to continue.";
    }
  }

  const noLoginMethodsConfigured = credentialsDisabled && noProvidersAvailable;

  return (
    <AuthLayout
      title={layoutTitle}
      description={layoutDescription}
    >
      <Head title="Log in" />

      {!noLoginMethodsConfigured && (
        <form className="flex flex-col gap-6" onSubmit={submit}>
          {!providersConfig?.disable_credentials_login && (
            <>
              <div className="grid gap-6">
            <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              required
              autoFocus
              tabIndex={1}
              autoComplete="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              placeholder="email@example.com"
            />
            <InputError message={errors.email} />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              {canResetPassword && (
                <TextLink
                  href={route("password.request")}
                  className="ml-auto text-sm"
                  tabIndex={5}
                >
                  Forgot password?
                </TextLink>
              )}
            </div>
            <Input
              id="password"
              type="password"
              required
              tabIndex={2}
              autoComplete="current-password"
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              placeholder="Password"
            />
            <InputError message={errors.password} />
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="remember"
              name="remember"
              checked={data.remember}
              onClick={() => setData("remember", !data.remember)}
              tabIndex={3}
            />
            <Label htmlFor="remember">Remember me</Label>
          </div>

          <Button
            type="submit"
            className="mt-4 w-full"
            tabIndex={4}
            disabled={processing}
          >
            {processing && <LoaderCircle className="w-4 h-4 animate-spin" />}
            Log in
          </Button>
            </div>
          </>
        )}

        {providersConfig && providersConfig.providers && providersConfig.providers.length > 0 && (
          <SocialitePlus
            providersConfig={providersConfig}
            showCredentialForm={!providersConfig.disable_credentials_login}
          />
        )}

        {!providersConfig?.disable_credentials_login && (
          <div className="text-sm text-center text-muted-foreground">
            Don't have an 2 account?{" "}
            <TextLink href={route("register")} tabIndex={5}>
              Sign up
            </TextLink>
          </div>
        )}
        </form>
      )}

      {status && (
        <div className="mb-4 text-sm font-medium text-center text-green-600">
          {status}
        </div>
      )}
    </AuthLayout>
  );
}
