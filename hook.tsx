import { useAppDispatch, useAppSelector } from "hooks";
import { useCallback } from "react";
import { AppReducerActions } from "store/app";
import { UserReducerActions } from "store/user";
import { ProfileService } from "services/api";
import { GenerateLimitExceededDialog } from "components/common/dialogs";

export default function useSubscriptionValidation() {
  const dispatch = useAppDispatch();

  const { currentPlan, currentSubscription, currentUser } = useAppSelector(
    (state) => state.user
  );
  const isFreePlan = currentPlan.id === 1;
  const validate = useCallback(
    async (options?: { isImage?: boolean; isUpdate?: boolean }) => {
      const { isImage = false, isUpdate = false } = options || {};
      // If no plan/subscription exists, fail early
      if (!currentPlan || !currentSubscription) return false;
      // Check expiry
      const isExpired =
        currentSubscription.end_at &&
        new Date(currentSubscription.end_at).getTime() < Date.now();

      if (isExpired || ["expired"].includes(currentSubscription.status)) {
        dispatch(AppReducerActions.openDialog("subscription-expired-dialog"));
        return false;
      }

      if (currentSubscription.status === "pending") {
        dispatch(AppReducerActions.openDialog("subscription-pending-dialog"));
        return false;
      }

      if (isFreePlan) {
        const isWordLimitExpired =
          currentSubscription.usage >= currentPlan.word_limit &&
          currentSubscription?.used_bonus >= currentSubscription?.earned_bonus;

        const isImageLimitExceeded =
          currentSubscription.image_usage >= currentPlan.image_limit;

        if (
          (isWordLimitExpired && isImageLimitExceeded) ||
          (isWordLimitExpired && !isImage) ||
          (isImageLimitExceeded && isImage)
        ) {
          let type: "both" | "word" | "image" = "word";
          if (isWordLimitExpired && isImageLimitExceeded) {
            type = "both";
          } else if (isWordLimitExpired && !isImage) {
            type = "word";
          } else if (isImageLimitExceeded && isImage) {
            type = "image";
          }
          dispatch(
            AppReducerActions.openDialog({
              dialog: GenerateLimitExceededDialog.dialogName,
              type,
            })
          );

          return false;
        }
      } else {
        try {
          const creditInfo = await ProfileService.getSubscriptionDetails();
          if (creditInfo) {
            const {
              used_credits = 0,
              addOnCredits = {},
              planCredits = {},
              plan_total_credit_usage = 0,
              total_add_on_credits = 0,
              used_bonus = 0,
              earned_bonus = 0,
            } = creditInfo;

            if (isUpdate) {
              const formattedAddOnCredits = ["word", "image", "voice"].reduce(
                (acc, key) => {
                  const credit = addOnCredits[key]?.credit ?? 0;
                  const usage = addOnCredits[key]?.usage ?? 0;
                  acc[key] = { credit, usage };
                  return acc;
                },
                {} as Record<string, { credit: number; usage: number }>
              );
              const formattedPlanCredits = ["word", "image", "voice"].reduce(
                (acc, key) => {
                  const credit = planCredits[key]?.credit ?? 0;
                  const usage = planCredits[key]?.usage ?? 0;
                  acc[key] = { credit, usage };
                  return acc;
                },
                {} as Record<string, { credit: number; usage: number }>
              );

              dispatch(
                UserReducerActions.updateCurrentDetails({
                  ...currentUser,
                  used_credits,
                  addOnCredits: formattedAddOnCredits,
                  planCredits: formattedPlanCredits,
                  plan_total_credit_usage,
                  total_add_on_credits,
                })
              );

              return true;
            }

            const isOutOfCredits =
              plan_total_credit_usage >= currentPlan.total_plan_credits &&
              !total_add_on_credits &&
              used_bonus >= earned_bonus;
            if (isOutOfCredits) {
              dispatch(
                AppReducerActions.openDialog(
                  GenerateLimitExceededDialog?.dialogName
                )
              );
              return false;
            }
          }
        } catch (error) {
          dispatch(
            AppReducerActions.handleApiError({
              isOpen: true,
              message: "Something went wrong!.",
              errorType: "error",
            })
          );
          return false;
        }
      }
      return true;
    },
    [currentPlan, currentSubscription, dispatch]
  );

  return { validate };
}
