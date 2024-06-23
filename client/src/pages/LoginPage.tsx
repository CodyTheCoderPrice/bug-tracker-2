import { useAppDispatch } from "@/app/hooks";
import { clearAuthErrors } from "@/features/auth/authSlice";
import { useEffect } from "react";
import Intro from "@/components/onboarding/Intro";
import Login from "@/features/auth/Login";
import Divider from "@/components/onboarding/Divider";
import LinkButton from "@/components/onboarding/LinkButton";
import CreationMessage from "@/components/onboarding/CreationMessage";

function LoginPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    return () => {
      dispatch(clearAuthErrors());
    };
  }, []);

  return (
    <div className="flex h-full">
      <Intro />
      <div className="w-[600px] bg-plain-light-100 p-12 shadow-md">
        <CreationMessage />
        <Login />
        <Divider text="OR" />
        <LinkButton to="/register" text="SIGN UP" />
      </div>
    </div>
  );
}

export default LoginPage;
