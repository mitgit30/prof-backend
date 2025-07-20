const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      console.log(error);
      
      res.status(error.statusCode || 502).json({
        message: "Error Occurred or Internal Server error",
        success: false,
      });
    }
  };
};

export default asyncHandler
