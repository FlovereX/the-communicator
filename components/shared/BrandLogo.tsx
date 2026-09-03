import Image from "next/image";

/** Official masthead lockup — replaces the plain "THE COMMUNICATOR" wordmark on auth screens. */
export function BrandLogo({ priority = false }: { priority?: boolean }) {
  return (
    <div className="mx-auto w-full max-w-[260px] sm:max-w-[280px]">
      <Image
        src="/branding/cropped-The-Communicator.webp"
        alt="The Communicator"
        width={1200}
        height={450}
        priority={priority}
        className="h-auto w-full"
      />
    </div>
  );
}
