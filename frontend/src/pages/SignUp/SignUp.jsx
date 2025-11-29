import { Link, useLocation, useNavigate } from "react-router";
import { FcGoogle } from "react-icons/fc";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import { TbFidgetSpinner } from "react-icons/tb";
import { useForm } from "react-hook-form";
import { imageUpload } from "../../utils";

const SignUp = () => {
  const { createUser, updateUserProfile, signInWithGoogle, loading } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state || "/";

  // --react hook form--
  const {
    register,
    handleSubmit,

    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const { name, image, email, password } = data;

    // --for image uploading , at first have to push image on formdata-->
    const imageFile = image?.[0];

    if (!imageFile) {
      toast.error("Please select a profile image");
      return;
    }

   
    try {
      const imageURL = await imageUpload(imageFile);

      //2. User Registration
      const result = await createUser(email, password);

      //3. Save username & profile photo and after uploading from imgbb imageURL set-->
      await updateUserProfile(name, imageURL);
      console.log(result);

      navigate(from, { replace: true });
      toast.success("Signup Successful");
    } catch (err) {
      console.log(err);
      toast.error(err?.message);
    }
  };
  console.log(errors);

  // Handle Google Signin
  const handleGoogleSignIn = async () => {
    try {
      //User Registration using google
      await signInWithGoogle();

      navigate(from, { replace: true });
      toast.success("Signup Successful");
    } catch (err) {
      console.log(err);
      toast.error(err?.message);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="flex flex-col max-w-md p-6 rounded-md sm:p-10 bg-gray-100 text-gray-900">
        <div className="mb-8 text-center">
          <h1 className="my-3 text-4xl font-bold">Sign Up</h1>
          <p className="text-sm text-gray-400">Welcome to PlantNet</p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate=""
          action=""
          className="space-y-6 ng-untouched ng-pristine ng-valid"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm">
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter Your Name Here"
                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-lime-500 bg-gray-200 text-gray-900"
                data-temp-mail-org="0"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-2 ml-3">
                  {errors.name.message}*
                </p>
              )}
            </div>
            {/* Image */}
            <div>
              <label
                htmlFor="image"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Profile Image
              </label>
              <input
                name="image"
                type="file"
                id="image"
                accept="image/*"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-lime-50 file:text-lime-700
                  hover:file:bg-lime-100
                  bg-gray-100 border border-dashed border-lime-300 rounded-md cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400
                  py-2"
                {...register("image", { required: true })}
              />
              <p className="mt-1 text-xs text-gray-400">
                PNG, JPG or JPEG (max 2MB)
              </p>
            </div>
            <div>
              <label htmlFor="email" className="block mb-2 text-sm">
                Email address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter Your Email Here"
                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-lime-500 bg-gray-200 text-gray-900"
                data-temp-mail-org="0"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-2 ml-3">
                  {errors.email.message}*
                </p>
              )}
            </div>
            <div>
              <div className="flex justify-between">
                <label htmlFor="password" className="text-sm mb-2">
                  Password
                </label>
              </div>
              <input
                type="password"
                autoComplete="new-password"
                id="password"
                placeholder="*******"
                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-lime-500 bg-gray-200 text-gray-900"
                {...register("password", {
                  required: "Password must required",
                  pattern: {
                    value: /^.{6,}$/,
                    message: "Password must have at least six characters",
                  },
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-2 ml-3">
                  {errors.password.message}*
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="bg-lime-500 w-full rounded-md py-3 text-white"
            >
              {loading ? (
                <TbFidgetSpinner className="animate-spin m-auto" />
              ) : (
                "Continue"
              )}
            </button>
          </div>
        </form>
        <div className="flex items-center pt-4 space-x-1">
          <div className="flex-1 h-px sm:w-16 dark:bg-gray-700"></div>
          <p className="px-3 text-sm dark:text-gray-400">
            Signup with social accounts
          </p>
          <div className="flex-1 h-px sm:w-16 dark:bg-gray-700"></div>
        </div>
        <div
          onClick={handleGoogleSignIn}
          className="flex justify-center items-center space-x-2 border m-3 p-2 border-gray-300 border-rounded cursor-pointer"
        >
          <FcGoogle size={32} />

          <p>Continue with Google</p>
        </div>
        <p className="px-6 text-sm text-center text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="hover:underline hover:text-lime-500 text-gray-600"
          >
            Login
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default SignUp;
