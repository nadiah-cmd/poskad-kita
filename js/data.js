export const DESTINATIONS = [
  { id: "johor", group: "negeri", menu: "Johor", title: "Johor Bahru", accent: "#1E4E86" },
  { id: "kedah", group: "negeri", menu: "Kedah", title: "Sawah padi", accent: "#3E7A32" },
  { id: "kelantan", group: "negeri", menu: "Kelantan", title: "Wau bulan", accent: "#9E2A3C" },
  { id: "melaka", group: "negeri", menu: "Melaka", title: "Kampung Morten", accent: "#D86A32" },
  { id: "negeri-sembilan", group: "negeri", menu: "Negeri Sembilan", title: "Warisan Minangkabau", accent: "#2F6B45" },
  { id: "pahang", group: "negeri", menu: "Pahang", title: "Cameron Highlands", accent: "#0E7A5F" },
  { id: "perak", group: "negeri", menu: "Perak", title: "Ipoh", accent: "#C4654A" },
  { id: "perlis", group: "negeri", menu: "Perlis", title: "Bukit kapur dan sawah", accent: "#A6843A" },
  { id: "pulau-pinang", group: "negeri", menu: "Pulau Pinang", title: "George Town", accent: "#3C4F8A" },
  { id: "sabah", group: "negeri", menu: "Sabah", title: "Gunung Kinabalu", accent: "#5C3D7A" },
  { id: "sarawak", group: "negeri", menu: "Sarawak", title: "Kuching", accent: "#0E6E6A" },
  { id: "selangor", group: "negeri", menu: "Selangor", title: "Batu Caves", accent: "#C47A3A" },
  { id: "terengganu", group: "negeri", menu: "Terengganu", title: "Pulau Redang", accent: "#0E8A90" },
  { id: "kuala-lumpur", group: "wilayah", menu: "Kuala Lumpur", title: "Menara Berkembar PETRONAS", accent: "#243A66" },
  { id: "putrajaya", group: "wilayah", menu: "Putrajaya", title: "Masjid Putra", accent: "#C46B80" },
  { id: "labuan", group: "wilayah", menu: "Labuan", title: "Pesisir Labuan", accent: "#2E6F9E" },
];

export const FEATURED_IDS = ["melaka", "pulau-pinang", "sarawak"];

export function getDestination(id) {
  return DESTINATIONS.find((item) => item.id === id) || DESTINATIONS.find((item) => item.id === "melaka");
}
