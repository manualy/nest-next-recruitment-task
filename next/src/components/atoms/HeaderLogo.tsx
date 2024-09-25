import Image from "next/image";

export const HeaderLogo = () => {
  return (
    <div className="w-full bg-[--background-rgb]">
      <div className="fixed w-full h-screen overflow-hidden pointer-events-none">
        <div
          className="w-[200%] h-screen -translate-x-[60%] -translate-y-[65%]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at center, rgba(151, 71, 255, 0.03) 0%, rgba(221, 66, 91, 0.1) 22%, rgba(237, 65, 54, 0.02) 52%, rgba(237, 65, 54, 0) 85%, rgba(255, 255, 255, 0) 100%)",
            backgroundSize: "contain",
          }}
        />
      </div>
      <div className="w-full flex items-center justify-start">
        <div className="px-28 pt-20 pb-8">
          <a
            className="min-w-[266px] cursor-pointer"
            href="https://example.com"
            target="_blank"
          >
            <Image
              className="hidden dark:block"
              src="/logo-dark.png"
              alt="Company logo dark"
              width={266}
              height={72}
              style={{ objectFit: "contain" }}
            />
            <Image
              className="block dark:hidden"
              src="/logo-light.png"
              alt="Company logo light"
              width={266}
              height={72}
              style={{ objectFit: "contain" }}
            />
          </a>
        </div>
      </div>
    </div>
  );
};
