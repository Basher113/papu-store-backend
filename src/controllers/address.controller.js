const prisma = require("../db");

// GET /addresses
const getUserAddressesController = async (req, res) => {
  try {
    const userId = req.user.id;

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    res.json(addresses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch addresses" });
  }
};

// GET /addresses/default
const getDefaultAddressController = async (req, res) => {
  try {
    const userId = req.user.id;

    const address = await prisma.address.findFirst({
      where: { userId, isDefault: true },
    });

    res.json(address);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch default address" });
  }
};

// POST /addresses
const addAddressController = async (req, res) => {
  try {
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
        isDefault: isFirst,
      },
    });

    res.status(201).json({ success: true, data: address });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add address" });
  }
};

// PATCH /addresses/:id
const updateAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { fullName, phoneNumber, street, barangay, city, postalCode } = req.body;

    const address = await prisma.address.findUnique({ where: { id } });

    if (!address || address.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: { fullName, phoneNumber, street, barangay, city, postalCode },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update address" });
  }
};

// DELETE /addresses/:id
const deleteAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const address = await prisma.address.findUnique({ where: { id } });

    if (!address || address.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await prisma.address.delete({ where: { id } });

    // If deleted address was default, set another as default
    if (address.isDefault) {
      const nextAddress = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });

      if (nextAddress) {
        await prisma.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    res.json({ success: true, message: "Address deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete address" });
  }
};

module.exports = {
  getUserAddressesController,
  getDefaultAddressController,
  addAddressController,
  updateAddressController,
  deleteAddressController,
};
