export default function manifest() {
  return {
    name: "نور الوالدين",
    short_name: "نور الوالدين",
    description: "منصة ختم القرآن الكريم والدعاء للوالدين",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf2",
    theme_color: "#2b2035",
    lang: "ar",
    dir: "rtl",
    icons: [
      { src: "/noor-n-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/noor-n-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/noor-n-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
