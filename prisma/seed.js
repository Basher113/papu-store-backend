const prisma = require("../src/db");

const populateProduct = async () => {
   const categories = [
    { name: "phones", iconUrl: "https://res.cloudinary.com/dynix3j26/image/upload/v1758991836/mobile_24dp_000000_FILL0_wght400_GRAD0_opsz24_jyaqea.png" },
    { name: "computer", iconUrl: "https://res.cloudinary.com/dynix3j26/image/upload/v1758991836/computer_24dp_000000_FILL0_wght400_GRAD0_opsz24_knd2o3.png" },
    { name: "gaming", iconUrl: "https://res.cloudinary.com/dynix3j26/image/upload/v1758991836/stadia_controller_24dp_000000_FILL0_wght400_GRAD0_opsz24_uum8nk.png" },
    { name: "camera", iconUrl: "https://res.cloudinary.com/dynix3j26/image/upload/v1758991837/photo_camera_24dp_000000_FILL0_wght400_GRAD0_opsz24_t9954s.png" },
    { name: "accessories", iconUrl: "https://res.cloudinary.com/dynix3j26/image/upload/v1758991836/devices_other_24dp_000000_FILL0_wght400_GRAD0_opsz24_a4ueso.png" },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    })
  }

  const phones = await prisma.category.findUnique({ where: { name: "phones" } })
  const gaming = await prisma.category.findUnique({ where: { name: "gaming" } })
  const computer = await prisma.category.findUnique({ where: { name: "computer" } })
  const camera = await prisma.category.findUnique({ where: { name: "camera" } })
  const accessories = await prisma.category.findUnique({ where: { name: "accessories" } })
  if (!phones || !gaming || !computer || !camera || !accessories) {
    console.log("Error in Prisma seed.");
    return;
  }

  // Helper to create products
  const createProduct = (name, description, imageUrl, price, categoryIds) =>
    prisma.product.create({
      data: {
        name,
        description,
        imageUrl,
        price,
        stock: Math.floor(Math.random() * 50) + 10,
        categories: {
          connect: categoryIds.map((id) => ({id})),
        },
      },
    })

  // 📱 Phones (10)
  await Promise.all([
    createProduct("iPhone 15 Pro Max", "Latest flagship iPhone with A17 Pro chip", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832278/istockphoto-904416788-1024x1024_mogykg.jpg",  1199.99, [phones.id]),
    createProduct("Samsung Galaxy S23 Ultra", "High-end Samsung flagship with S Pen", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832277/istockphoto-579156228-1024x1024_x8o1sc.jpg", 1099.99, [phones.id]),
    createProduct("Google Pixel 8 Pro", "Google's premium phone with AI features", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832275/istockphoto-511991248-1024x1024_xhwjdb.jpg", 999.99, [phones.id]),
    createProduct("OnePlus 11 5G", "Flagship killer with Snapdragon 8 Gen 2", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832275/istockphoto-465471782-1024x1024_ethdhj.jpg",799.99, [phones.id]),
    createProduct("Xiaomi 13 Pro", "Powerful flagship with Leica cameras", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832273/istockphoto-469254502-1024x1024_enf0mi.jpg",899.99, [phones.id]),
    createProduct("Huawei Mate 50 Pro", "High-performance phone with great cameras", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832271/istockphoto-1050213200-1024x1024_nfxkb8.jpg",899.99, [phones.id]),
    createProduct("Sony Xperia 1 V", "4K HDR OLED smartphone", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832270/istockphoto-1507080527-1024x1024_sesqso.jpg", 1199.99, [phones.id]),
    createProduct("Oppo Find X6 Pro", "Premium Android flagship with curved display", "https://res.cloudinary.com/dynix3j26/image/upload/v1758992747/istockphoto-1416168804-1024x1024_hzqi5k.jpg", 999.99, [phones.id]),
    createProduct("Nothing Phone (2)", "Minimalist smartphone with LED Glyph", "https://res.cloudinary.com/dynix3j26/image/upload/v1758992728/istockphoto-170455282-1024x1024_ywdtug.jpg", 699.99, [phones.id]),
    createProduct("Asus ROG Phone 7", "Gaming smartphone with cooling system", "https://res.cloudinary.com/dynix3j26/image/upload/v1758992779/istockphoto-910633906-1024x1024_uqpk4h.jpg", 1099.99, [phones.id]),
  ])

  // 🎮 Gaming Keyboards (10)
  await Promise.all([
    createProduct("HyperX Alloy Origins RGB Keyboard", "Mechanical gaming keyboard with RGB", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832260/istockphoto-487051999-1024x1024_uqeugb.jpg", 129.99, [accessories.id, gaming.id]),
    createProduct("Razer BlackWidow V3 Mechanical", "High-performance mechanical gaming keyboard", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832259/istockphoto-2223125425-1024x1024_lab27a.jpg",  149.99, [accessories.id, gaming.id]),
    createProduct("SteelSeries Apex Pro TKL", "Adjustable mechanical switches keyboard", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832258/istockphoto-2159453738-1024x1024_pdzcwd.jpg",  179.99, [accessories.id, gaming.id]),
    createProduct("Logitech G915 Lightspeed Wireless", "Wireless low-profile gaming keyboard", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832256/istockphoto-175450321-1024x1024_kd37fo.jpg",  229.99, [accessories.id, gaming.id]),
    createProduct("Corsair K70 RGB Pro", "Durable aluminum frame RGB keyboard", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832255/istockphoto-153065264-1024x1024_fnzhlm.jpg",  169.99, [accessories.id, gaming.id]),
    createProduct("Asus ROG Strix Scope RX", "Optical mechanical switches for gamers", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832254/istockphoto-1416996618-1024x1024_u9rkug.jpg",  139.99, [accessories.id, gaming.id]),
    createProduct("Redragon K552 Kumara", "Budget-friendly mechanical keyboard", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832252/istockphoto-1408312484-1024x1024_pc7q8i.jpg",  49.99, [accessories.id, gaming.id]),
    createProduct("Cooler Master CK552 RGB", "RGB mechanical gaming keyboard", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832251/istockphoto-1396231106-1024x1024_gdbzxd.jpg",  89.99, [accessories.id, gaming.id]),
    createProduct("MSI Vigor GK50 Elite", "Gaming keyboard with Kailh switches", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832248/istockphoto-1222651275-1024x1024_fvbwbp.jpg",  99.99, [accessories.id, gaming.id]),
    createProduct("Roccat Vulcan 121 AIMO", "Premium gaming keyboard with Titan switches", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832247/istockphoto-1356366044-1024x1024_puwo2f.jpg",  159.99, [accessories.id, gaming.id]),
  ])

  // 🎮 Gaming Consoles (6)
  await Promise.all([
    createProduct("Sony PlayStation 5 Disc Edition", "Latest-gen console by Sony", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832245/istockphoto-1851981446-1024x1024_bpzus5.jpg", 499.99, [gaming.id]),
    createProduct("Microsoft Xbox Series X", "4K gaming console with Game Pass support", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832244/istockphoto-530010099-1024x1024_t4yjcl.jpg",  499.99, [gaming.id]),
    createProduct("Microsoft Xbox Series S", "Compact version of Xbox Series X", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832243/istockphoto-855056082-1024x1024_jje2n4.jpg",  299.99, [gaming.id]),
    createProduct("Nintendo Switch OLED", "Portable hybrid gaming console", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832241/istockphoto-1044108540-1024x1024_jiw2le.jpg",  349.99, [gaming.id]),
    createProduct("Steam Deck 512GB", "Handheld gaming PC", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832240/istockphoto-1388772975-1024x1024_n38fqf.jpg",  649.99, [gaming.id]),
    createProduct("PlayStation 4 Pro", "Previous-gen console with 4K support", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832239/istockphoto-1129382817-1024x1024_bj9zys.jpg",  399.99, [gaming.id]),
  ])

  await Promise.all([
    createProduct("ASUS ROG Swift PG259QN 360Hz", "High refresh rate esports monitor", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832217/MSI-Mag-341CQP-QD-OLED-Gaming-Monitor-Offwhite-Background-SOURCE-Amazon_somdc9.webp", 699.99, [computer.id, gaming.id]),
    createProduct("Acer Predator XB273K 27 4K", "4K HDR monitor with G-Sync",  "https://res.cloudinary.com/dynix3j26/image/upload/v1758832214/istockphoto-614142568-1024x1024_fqliar.jpg", 899.99, [computer.id, gaming.id]),
    createProduct("Dell Alienware AW2721D QHD", "240Hz QHD  monitor",  "https://res.cloudinary.com/dynix3j26/image/upload/v1758832216/istockphoto-829504794-1024x1024_acfihg.jpg", 799.99, [computer.id]),
    createProduct("MSI Optix MAG274QRF-QD", "1440p IPS gaming monitor",  "https://res.cloudinary.com/dynix3j26/image/upload/v1758832208/alienware-34-curved-gaming-monitor-aw3420dw_11z6.1920_exf86r.webp", 499.99, [computer.id]),
    createProduct("Gigabyte AORUS FI27Q-P", "QHD monitor with HDR support",  "https://res.cloudinary.com/dynix3j26/image/upload/v1758832212/istockphoto-611294276-1024x1024_in0e9n.jpg", 549.99, [computer.id]),
  ])

  await Promise.all([
    createProduct("ASUS ROG Zephyrus G14", "Compact gaming laptop with RTX 40 series", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832220/Pngtree_gaming_laptop_illustration_19849014_ccpujo.png",  1599.99, [computer.id, gaming.id]),
    createProduct("MSI GE76 Raider", "High-performance gaming laptop", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832219/Pngtree_asus_elegant_gaming_laptop_17033096_gc11f9.png",  2199.99, [computer.id, gaming.id]),
    createProduct("Acer Predator Helios 300", "Popular midrange gaming laptop", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832213/istockphoto-505227671-1024x1024_zw1acc.jpg",  1299.99, [computer.id, gaming.id]),
    createProduct("Macrong 15 Advanced", "Premium thin High-performance laptop Top-tier", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832211/istockphoto-1034249358-1024x1024_owfcuu.jpg",  2499.99, [computer.id]),
    createProduct("Lenovo Legion 7i", "Top-tier laptop with i9 CPU", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832209/istockphoto-1140541722-1024x1024_pgw5yc.jpg",  1999.99, [computer.id]),
  ])

  // 🎧 Headphones (10: 5 gaming, 5 not)
  await Promise.all([

    createProduct("SteelSeries Arctis 7 Wireless", "Gaming headset with DTS surround sound", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832230/istockphoto-182460766-1024x1024_bafqvw.jpg",  149.99, [accessories.id, gaming.id]),
    createProduct("Razer Kraken Tournament Edition", "Gaming headset with THX audio", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832236/istockphoto-873874310-1024x1024_mzx4a3.jpg",  99.99, [accessories.id, gaming.id]),
    createProduct("HyperX Cloud II", "Legendary gaming headset", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832233/istockphoto-860853774-1024x1024_qewabo.jpg",  99.99, [accessories.id, gaming.id]),
    createProduct("Corsair HS80 Wireless", "Wireless gaming headset with RGB", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832226/istockphoto-1182209797-1024x1024_p1p5ag.jpg",  149.99, [accessories.id, gaming.id]),
    createProduct("Logitech G Pro X Wireless", "Pro-grade Comfortable wireless headset", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832229/istockphoto-1479725750-1024x1024_lpqcgs.jpg",  199.99, [accessories.id]),
    createProduct("Sony WH-1000XM5", "Noise-canceling over-ear headphones", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832232/istockphoto-847775138-1024x1024_ox7wnn.jpg",  399.99, [accessories.id]),
    createProduct("Bose QuietComfort 45", "Comfortable ANC headphones", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832224/istockphoto-1160061551-1024x1024_bmcvg2.jpg",  329.99, [accessories.id]),
    createProduct("Apple AirPods Max", "Premium wireless headphones", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832227/istockphoto-1366478841-1024x1024_k8same.jpg",  549.99, [accessories.id]),
    createProduct("Sennheiser HD 599", "Audiophile-grade headphones", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832223/istockphoto-1134750837-1024x1024_vxz9am.jpg",  249.99, [accessories.id]),
    createProduct("JBL Live 660NC", "ANC wireless headphones", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832226/istockphoto-1182209797-1024x1024_p1p5ag.jpg",  199.99, [accessories.id]),
  ])

  // 🪑 Gaming Chairs (6)
  await Promise.all([
    createProduct("Secretlab Titan Evo 2022", "Premium gaming chair", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832205/istockphoto-2183739559-1024x1024_g0tlel.jpg",  499.99, [gaming.id]),
    createProduct("DXRacer Formula Series", "Popular esports gaming chair", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832202/istockphoto-1772598379-1024x1024_agstm1.jpg",  299.99, [gaming.id]),
    createProduct("AKRacing Masters Series Pro", "Large ergonomic gaming chair", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832199/istockphoto-1299679540-1024x1024_o2vbrg.jpg",  399.99, [gaming.id]),
    createProduct("Razer Iskur X", "Ergonomic gaming chair by Razer", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832198/istockphoto-1263458593-1024x1024_mnz4rq.jpg",  349.99, [gaming.id]),
    createProduct("Cougar Armor S", "Racing-style gaming chair", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832196/istockphoto-1227280035-1024x1024_lhz60s.jpg",  249.99, [gaming.id]),
    createProduct("AndaSeat Kaiser 3", "Durable ergonomic gaming chair", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832194/istockphoto-1213709609-1024x1024_yjhfqx.jpg",  449.99, [gaming.id]),
  ])

  // 📷 Cameras (10)
  await Promise.all([
    createProduct("Canon EOS R5", "Professional mirrorless camera", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832124/istockphoto-144279192-1024x1024_ju6kwo.jpg",  3899.99, [camera.id]),
    createProduct("Nikon Z7 II", "High-resolution full-frame camera", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832127/istockphoto-497273187-1024x1024_mjqd0r.jpg",  2999.99, [camera.id]),
    createProduct("Sony A7 IV", "Versatile full-frame mirrorless camera", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832126/istockphoto-2184290381-1024x1024_cvg9ge.jpg",  2499.99, [camera.id]),
    createProduct("Fujifilm X-T5", "APS-C mirrorless with retro design", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832125/istockphoto-172143391-1024x1024_rssse4.jpg",  1699.99, [camera.id]),
    createProduct("Panasonic Lumix GH6", "Video-focused micro four thirds camera", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832125/istockphoto-170434745-1024x1024_ft9rqu.jpg",  1999.99, [camera.id]),
    createProduct("Canon EOS R6 Mark II", "Fast and versatile full-frame camera", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832125/istockphoto-147019649-1024x1024_f6jjg4.jpg",  2499.99, [camera.id]),
    createProduct("Nikon Z6 II", "Balanced full-frame mirrorless", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832124/istockphoto-152013604-1024x1024_shloaz.jpg",  1999.99, [camera.id]),
    createProduct("Sony FX3", "Cinema-focused compact camera", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832124/istockphoto-155802982-1024x1024_f2xwkd.jpg",  3899.99, [camera.id]),
    createProduct("Olympus OM-D E-M1 Mark III", "Compact micro four thirds camera", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832124/istockphoto-118201323-1024x1024_iq4qpd.jpg",  1799.99, [camera.id]),
    createProduct("Leica Q2", "Premium compact full-frame camera", "https://res.cloudinary.com/dynix3j26/image/upload/v1758832127/istockphoto-966434916-1024x1024_b9czdc.jpg",  4999.99, [camera.id]),
  ])
}

populateProduct();