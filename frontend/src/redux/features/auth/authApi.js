import { apiSlice } from "@/redux/api/apiSlice";
import { userLoggedIn, setSingleUser } from "./authSlice";
import Cookies from "js-cookie";

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ✅ get single user
    getSingleUser: builder.query({
      query: (id) => ({
        url: `/user/single/${id}`,
        method: "GET",
      }),
    }),

    signUpProvider: builder.mutation({
      query: (data) => ({
        url: "/user/google-login",
        method: "POST",
        body: data,
      }),

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;

          Cookies.set(
            "userInfo",
            JSON.stringify({
              accessToken: result.data.token,
              user: result.data.user,
            }),
            { expires: 0.5 }
          );

          dispatch(
            userLoggedIn({
              accessToken: result.data.token,
              user: result.data.user,
            })
          );

          // ✅ fetch single user and store in state (no change to previous logic)
          const userId = result?.data?.user?.user_id;
          if (userId) {
            const single = await dispatch(
              authApi.endpoints.getSingleUser.initiate(userId, { forceRefetch: true })
            ).unwrap();

            // backend response maybe {data: {...}} or direct object
            dispatch(setSingleUser(single?.data ?? single));
          }
        } catch (err) {
          // do nothing
        }
      },
    }),

    // login
    loginUser: builder.mutation({
      query: (data) => ({
        url: "/user/login",
        method: "POST",
        body: data,
      }),

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;

          Cookies.set(
            "userInfo",
            JSON.stringify({
              accessToken: result.data.token,
              user: result.data.user,
            }),
            { expires: 0.5 }
          );

          dispatch(
            userLoggedIn({
              accessToken: result.data.token,
              user: result.data.user,
            })
          );

          // ✅ fetch single user and store in state
          const userId = result?.data?.user?.user_id;
          if (userId) {
            const single = await dispatch(
              authApi.endpoints.getSingleUser.initiate(userId, { forceRefetch: true })
            ).unwrap();

            dispatch(setSingleUser(single?.data ?? single));
          }
        } catch (err) {
          // do nothing
        }
      },
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: `/customer/update`,
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginUserMutation,
  useSignUpProviderMutation,

  // ✅ hook (optional use anywhere)
  useGetSingleUserQuery,
  useLazyGetSingleUserQuery,

  useUpdateProfileMutation,
} = authApi;