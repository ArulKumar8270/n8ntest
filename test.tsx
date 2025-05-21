
import CreditUsageProgressBar from "./CreditUsageProgressBar";
import { useAppSelector } from "hooks";
import FeaturesDropdown from "./FeaturesDropdown";
import CreditUsageCard from "./CreditUsageCard";

export default function PlanCredits() {
  const currentSubscription = useAppSelector(
    (rootState) => rootState.user.currentSubscription
  );
  const currentPlan = useAppSelector((rootState) => rootState.user.currentPlan);
  const currentUser = useAppSelector((rootState) => rootState.user.currentUser);

  console.log("currentPlan34523", currentUser?.addOnCredits, currentUser?.planCredits);
  return (
    <>
      {currentSubscription && currentPlan && (
        <div className="flex flex-col">
          {currentPlan?.id !== 1 ? (
           <>
              <CreditUsageProgressBar
                name="Credits"
                usage={currentUser?.plan_total_credit_usage}
                limit={Number(currentPlan?.total_plan_credits)}
                type="word"
              />
             
              <CreditUsageCard creditDetails={currentUser?.planCredits} />
            </>
          ) : (
            <>
                      <CreditUsageProgressBar
                        name="Words"
                        usage={currentSubscription?.usage}
                        limit={currentPlan?.word_limit}
                        type="word"
                      />
                      <CreditUsageProgressBar
                        name="Image"
                        usage={currentSubscription?.image_usage}
                        limit={currentPlan?.image_limit}
                        type="image"
                      />
            </>
          )}
          {currentSubscription?.earned_bonus ? (
            <CreditUsageProgressBar
              name={currentPlan?.id === 1 ? "Reward words" : "Reward Credits"}
              usage={currentSubscription?.used_bonus}
              limit={currentSubscription?.earned_bonus}
              type="bonus"
            />
          ): null}
        </div>
      )}
      <div className="mt-9">
        <FeaturesDropdown currentSubscription={currentSubscription} />
      </div>
    </>
  );
}
