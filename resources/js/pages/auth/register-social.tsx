import { Head, useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { FormEventHandler } from "react";

import InputError from "@/components/input-error";
import SocialitePlus from "@/components/socialite-plus";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

interface SocialRegisterProps {
  providersConfig?: {
    button_text: string;
    providers: { name: string; icon: string; branded: boolean }[];
    disable_credentials_login?: boolean;
  };
}

export default function Register({ providersConfig }: SocialRegisterProps) {
  const { data, setData, post, processing, errors, reset } = useForm<
    Required<RegisterForm>
  >({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route("register"), {
      onFinish: () => reset("password", "password_confirmation"),
    });
  };

  const noProvidersAvailable =
    !providersConfig?.providers || providersConfig.providers.length === 0;
  const credentialsDisabled = providersConfig?.disable_credentials_login;

  let layoutTitle = "Create an account";
  let layoutDescription = "Enter your details below to create your account";

  if (credentialsDisabled) {
    if (noProvidersAvailable) {
      layoutTitle = "Registration Unavailable";
      layoutDescription =
        "No registration methods are currently configured. Please contact an administrator.";
    } else {
      layoutTitle = "Sign up with your social account";
      layoutDescription = "Select a provider below to create your account.";
    }
  }

  const noRegistrationMethodsConfigured = credentialsDisabled && noProvidersAvailable;

  return (
    <AuthLayout
      title={layoutTitle}
      description={layoutDescription}
    >
      <Head title="Register" />
      {!noRegistrationMethodsConfigured && (
      <form className="flex flex-col gap-6" onSubmit={submit}>
        {!providersConfig?.disable_credentials_login && (
          <>
            <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              required
              autoFocus
              tabIndex={1}
              autoComplete="name"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              disabled={processing}
              placeholder="Full name"
            />
            <InputError message={errors.name} className="mt-2" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              required
              tabIndex={2}
              autoComplete="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              disabled={processing}
              placeholder="email@example.com"
            />
            <InputError message={errors.email} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              tabIndex={3}
              autoComplete="new-password"
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              disabled={processing}
              placeholder="Password"
            />
            <InputError message={errors.password} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password_confirmation">Confirm password</Label>
            <Input
              id="password_confirmation"
              type="password"
              required
              tabIndex={4}
              autoComplete="new-password"
              value={data.password_confirmation}
              onChange={(e) => setData("password_confirmation", e.target.value)}
              disabled={processing}
              placeholder="Confirm password"
            />
            <InputError message={errors.password_confirmation} />
          </div>

          <Button
            type="submit"
            className="mt-2 w-full"
            tabIndex={5}
            disabled={processing}
          >
            {processing && <LoaderCircle className="w-4 h-4 animate-spin" />}
            Create account
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
            Already have an account?{" "}
            <TextLink href={route("login")} tabIndex={6}>
              Log in
            </TextLink>
          </div>
        )}
      </form>
      )}
    </AuthLayout>
  );
}
