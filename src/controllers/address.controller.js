const prisma = require("../db");

const getUserAddressesController = async (req, res) => {
  const userId = req.user.id;

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  res.json(addresses);
};

// GET /addresses/default
const getDefaultAddressController = async (req, res) => {
  const userId = req.user.id;

  const address = await prisma.address.findFirst({
    where: { userId, isDefault: true },
  });

  res.json(address);
};

// POST /addresses
const addAddressController = async (req, res) => {
  const userId = req.user.id;
  const { fullName, phoneNumber, street, barangay, city, postalCode } = req.body;

  const count = await prisma.address.count({ where: { userId } });

  if (count >= 2) {
    return res.status(400).json({
      success: false,
      message: "Maximum of 2 addresses only.",
    });
  }

  const isFirst = count === 0;

  const address = await prisma.address.create({
    data: {
      userId,
      fullName,
      phoneNumber,
      street,
      barangay,
      city,
      postalCode,
      isDefault: isFirst, // auto default if first
    },
  });

  res.status(201).json({ success: true, data: address });
};

// PATCH /addresses/:id
const updateAddressController = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { fullName, phoneNumber, street, barangay, city, postalCode } = req.body;

  const address = await prisma.address.findUnique({ where: { id } });

  if (!address || address.userId !== userId) {
    return res.status(404).json({ success: false, message: "Address not found" });
  }

  const updated = await prisma.address.update({
    where: { id },
    data: { fullName, phoneNumber, street, barangay, city, postalCode },
  });

  res.json({ success: true, data: updated });
};

module.exports = {getUserAddressesController, getDefaultAddressController, addAddressController, updateAddressController};