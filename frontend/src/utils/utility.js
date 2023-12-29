const filterErrorMessages = function (errorStatus) {
  let errorMessage = "";
  switch (errorStatus) {
    case 400:
      errorMessage =
        "Couldn't use resources! Please provide correct and complete inputs!";
      break;

    case 401:
      errorMessage =
        "You are unauthorized from accessing since your key expired! Please login again!";
      break;

    case 403:
      errorMessage = "You are forbidden from accessing! Please login first!";
      break;

    case 404:
      errorMessage = "Resource not found! Please provide the right identifier!";
      break;

    default:
      errorMessage = "Internal server error!";
      break;
  }

  return errorMessage;
};

export { filterErrorMessages };
