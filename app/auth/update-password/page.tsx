import { UpdatePasswordForm } from "@/components/UpdatePasswordForm";

export default function Page() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm z-10">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
