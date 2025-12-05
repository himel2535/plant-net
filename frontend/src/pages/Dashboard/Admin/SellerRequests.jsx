import { useQuery } from "@tanstack/react-query";
import SellerRequestsDataRow from "../../../components/Dashboard/TableRows/SellerRequestsDataRow";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const SellerRequests = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const { data: requests = [], isLoading,refetch } = useQuery({
    queryKey: ["seller-requests", user?.email],
    queryFn: async () => {
      const result = await axiosSecure(`/seller-requests`);
      return result.data;
    },
  });
  console.log(requests);

  // console.log(data)
  if (isLoading) return <LoadingSpinner></LoadingSpinner>;

  return (
    <>
      <div className="container mx-auto px-4 sm:px-8">
        <div className="py-8">
          <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
            <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* <SellerRequestsDataRow /> */}
                  {requests.map((req) => (
                    <SellerRequestsDataRow key={req._id} req={req} refetch={refetch}/>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerRequests;
