import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadFile from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // 1. Get user details from user means from req.body or frontend => ( another aspect like backend )
  // 2. Ensure that user enters all the required fields and if not return an error ( Validations )
  // 3. Check if user is already registered => username, email
  // 4. Check for images , check for avatar
  // If success then upload them to cloudinary, avatar
  // 5. Create user object , creat entries in database
  // 6. Remove password and refresh token field from response
  // 7. IF user enters all the details correctly then store the those details in any databBase such as MongoDb

  const { fullname, email, username, password } = req.body;

  if (!fullname || !email || !username || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(408, "User already registered with username or email");
  }

  const avatarLocalPath = req.files?.avatar[0].path;
  const coverImageLocalPath = req.files?.coverImage[0].path;

  if (!avatarLocalPath) {
    throw new ApiError(409, "Local file path not found");
  }

  const avatar = await uploadFile(avatarLocalPath);
  const coverImage = await uploadFile(coverImageLocalPath);
  console.log(avatar)

  if (!avatar) {
    throw new ApiError(500, "Something went wrong while uploading file");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    fullname: fullname,
    password: password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email: email,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(503,"Somenthing went wrong while registering user",);
  }

  return res.status(200).json(new ApiResponse(201, createdUser, "Successfully created the user"));
});

export default registerUser;
