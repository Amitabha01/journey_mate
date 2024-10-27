const register = async (req, res) => {
  const { fullName, email, password } = req.body;
  //validation fields
  if (!fullName || !email || !password) {
    throw new AppError("All fields are required", 400)
  }
  //check if user is already registere
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new AppError("User already exists", 409)
    }
    // Ensure name is not null to avoid MongoServerError

    if (!fullName) {
      throw new AppError("Name cannot be null", 400);
    }
    const user = await User.create({
      fullName,
      email,
      password,
    });

    if (!user) {
      throw new AppError("Registration failed, Please try again", 400);
    }
    //T0D0: file upload
    if (req.file) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_API_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "journeymate/avaters",
          width: 150,
          height: 150,
          crop: "fill",
          gravity: "face",
        });

        if (result) {
          user.avater = {
            public_id: result.public_id,
            secqure_url: result.url,
          };

          //remove file from server
          fs.rm(uploads/${req.file.filename});
        }
      } catch (error) {
        throw new AppError(error || "File upload failed, Please try again", 500)

      }
    }

    await user.save();
    user.password = undefined;
    console.log(user);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while registering user",
      error,
    });
  }
};