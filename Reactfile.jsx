import { Link, useNavigate } from "react-router-dom";
import CustomButton from "../CustomButton";
import { OfferDialog } from "components/common/dialogs";
import { AppReducerActions } from "store/app";
import { useAppDispatch, useAppSelector, useWindowSize } from "hooks";
import MenuIcon from "assets/icon_svg/menu.svg";
import GravityWriteLogo from "assets/logo_svg/gravityWrite.svg";
import gravityWriteLogoShorthand from "assets/logo_svg/gravityWriteLogoShort.svg";
import Searchbar from "./Searchbar";

import Timer from "components/common/Timer";
import CustomTooltip from "../CustomTooltip";
/**
 * App Header that stays sticky on almost all common pages
 */
export default function AppHeader() {
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector(
    (rootState) => rootState.app.sidebar.open
  );
  const timerActive = useAppSelector((rootState) => rootState.app.timerActive);
  const navigate = useNavigate();
  const pricingPlans = useAppSelector(
    (rootState) => rootState.app.pricingPlans
  );
  const currentPlan = useAppSelector((rootState) => rootState.user.currentPlan);
  const currentSubscription = useAppSelector(
    (rootState) => rootState.user.currentSubscription
  );
  const { width } = useWindowSize();

  const starterPlan = pricingPlans.find((plan) => plan.id === 2);
  const proPlan = pricingPlans.find((plan) => plan.id === 3);

  return (
    <div className="sticky top-0 w-full bg-white">
      <div className="flex items-center justify-between h-full border-r min-h-14">
        {!isSidebarOpen && (
          <div className="flex items-center justify-between py-2 pr-2 border-r cursor-pointer md:pr-7 ps-3">
            <Link to="/home">
              <img
                src={GravityWriteLogo}
                className="hidden w-auto h-10 p-2 transition cursor-pointer md:block hover:bg-palatinate-blue-50"
                alt="logo"
              />

              <img
                src={gravityWriteLogoShorthand}
                alt="logo"
                className="w-6 h-auto cursor-pointer md:hidden"
              />
            </Link>
            <div className="my-auto cursor-pointer group ms-3 md:ms-[32px]">
              <CustomTooltip title="Open Sidebar" placement="bottom">
                <img
                  src={MenuIcon}
                  className="w-5 h-auto group"
                  onClick={() => dispatch(AppReducerActions.toggleSidebar())}
                />
              </CustomTooltip>
            </div>
          </div>
        )}
        {localStorage.getItem("is-impersonated") === "true" && (
          <a
            href="https://app2.gravitywrite.com/login"
            className="px-4 hidden py-2 mx-4 text-palatinate-blue-600 md:flex gap-3 items-center rounded-md bg-gradient-to-r from-[#963FFF]/10 to-[#2E42FF1A]/10"
          >
            <span className="fa fa-sparkles"></span>
            <span>Switch to Old UI</span>
          </a>
        )}
        <Searchbar />
        <Timer />
        <div className="ml-[19px] py-2.5 pr-5 flex items-center gap-3">
          {/* <NotificationIcon /> */}
          {/* {!Number(currentSubscription?.total_add_on_credits) ? 
          <div className="flex items-center gap-3 border border-[#DCE6EF] rounded-[6px] p-[5px] px-[8px]">
            <WordsIcons color="#2D3A47" /> <SpiltBarderIcons />
            <ImageIcon color="#2D3A47" /> <SpiltBarderIcons /> <p>{currentSubscription?.plan_total_credit} Credit</p>{" "}
            <CustomButton
              variant={timerActive ? "solid" : "semi-solid"}
              size="small"
              onClick={() => navigate("/pricing")}
              children={"Buy"}
            />
          </div> : null
          } */}
          {currentPlan?.id !== 3 && (
            <CustomButton
              variant={timerActive ? "solid" : "gradient"}
              size="medium"
              onClick={() => {
                if (timerActive) {
                  dispatch(
                    AppReducerActions.openDialog(OfferDialog.dialogName)
                  );
                } else {
                  navigate("/pricing");
                }
              }}
            >
              {!timerActive ? (
                <div>
                  <span className="flex items-center gap-1.5 w-[80%] mx-auto justify-center">
                    {/* <img
                    src={upgradeIcon}
                    alt="upgrade icon"
                    className="w-4 h-4"
                  /> */}
                    Upgrade
                  </span>
                </div>
              ) : width < 640 ? (
                <span>
                  {currentPlan?.id === 1 &&
                    `"Offer" - 💰 $${parseInt(
                      starterPlan?.offer_price || "0"
                    )}`}
                  {currentPlan?.id === 2 &&
                    `Offer - 💰 $${parseInt(proPlan?.offer_price || "0")}`}
                </span>
              ) : (
                <p>
                  <span className="mr-1 wave"> ⏰ </span>
                  {currentPlan?.id === 1 &&
                    `${starterPlan?.offer_title} - 💰 $${parseInt(
                      starterPlan?.offer_price || "0"
                    )}`}
                  {currentPlan?.id === 2 &&
                    `${proPlan?.offer_title} - 💰 $${parseInt(
                      proPlan?.offer_price || "0"
                    )}`}
                </p>
              )}
            </CustomButton>
          )}
        </div>
      </div>
    </div>
  );
}
