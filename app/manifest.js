export default function manifest() {
  return {
    name: "نور الوالدين",
    short_name: "نور الوالدين",
    description: "منصة ختم القرآن الكريم والدعاء للوالدين",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf2",
    theme_color: "#1f7a55",
    lang: "ar",
    dir: "rtl",
    icons: [{ src: "/khatma.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }],
  };
}
