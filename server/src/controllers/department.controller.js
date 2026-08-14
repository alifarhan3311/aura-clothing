import Department from "../models/Department.js";
import Category from "../models/Category.js";
import { buildPublicPath, deleteFile } from "../middlewares/upload.middleware.js";

// Helper to seed defaults if DB is empty
export const seedDefaultDepartments = async () => {
  try {
    const count = await Department.countDocuments();
    if (count === 0) {
      const defaults = [
        {
          name: "Women",
          slug: "women",
          subtitle: "Elegant & Effortless",
          icon: "👗",
          image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
          order: 1,
        },
        {
          name: "Men",
          slug: "men",
          subtitle: "Sharp & Refined",
          icon: "👔",
          image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
          order: 2,
        },
        {
          name: "Kids",
          slug: "kids",
          subtitle: "Playful & Comfortable",
          icon: "👦",
          image: "https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=800&q=80",
          order: 3,
        },
      ];
      const created = await Department.insertMany(defaults);
      console.log("Seeded default departments: Women, Men, Kids");

      // Auto-link existing categories to these newly seeded departments by section slug
      for (const dept of created) {
        await Category.updateMany(
          { section: dept.slug, department: null },
          { department: dept._id }
        );
      }
    }
  } catch (err) {
    console.warn("Department seeding skipped:", err.message);
  }
};

// GET /api/departments — Public list of active departments
export const getActiveDepartments = async (req, res, next) => {
  try {
    await seedDefaultDepartments();
    const departments = await Department.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, departments });
  } catch (error) {
    next(error);
  }
};

// GET /api/departments/admin — Admin list of all departments
export const getAllDepartmentsAdmin = async (req, res, next) => {
  try {
    await seedDefaultDepartments();
    const departments = await Department.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, departments });
  } catch (error) {
    next(error);
  }
};

// GET /api/departments/:idOrSlug
export const getDepartment = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };

    const department = await Department.findOne(query);
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

// POST /api/departments — Create department (Admin)
export const createDepartment = async (req, res, next) => {
  try {
    const { name, subtitle, icon, order, isActive, imageUrl } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Department name is required" });
    }

    let image = imageUrl || "";
    if (req.file) {
      image = buildPublicPath(req.file);
    }

    const department = await Department.create({
      name,
      subtitle: subtitle || "",
      icon: icon || "✨",
      image,
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? (isActive === "true" || isActive === true) : true,
    });

    res.status(201).json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

// PUT /api/departments/:id — Update department (Admin)
export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    const { name, subtitle, icon, order, isActive, imageUrl } = req.body;

    if (req.file) {
      if (department.image && department.image.startsWith("/uploads/")) {
        deleteFile(department.image);
      }
      department.image = buildPublicPath(req.file);
    } else if (imageUrl !== undefined) {
      department.image = imageUrl;
    }

    if (name !== undefined) department.name = name;
    if (subtitle !== undefined) department.subtitle = subtitle;
    if (icon !== undefined) department.icon = icon;
    if (order !== undefined) department.order = Number(order);
    if (isActive !== undefined) department.isActive = isActive === "true" || isActive === true;

    await department.save();
    res.json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/departments/:id/status — Toggle status
export const updateDepartmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const department = await Department.findByIdAndUpdate(
      id,
      { isActive: Boolean(isActive) },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/departments/:id
export const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    if (department.image && department.image.startsWith("/uploads/")) {
      deleteFile(department.image);
    }

    // Unlink from any categories that reference this department
    await Category.updateMany({ department: id }, { department: null });

    await department.deleteOne();
    res.json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    next(error);
  }
};
