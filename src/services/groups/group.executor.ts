import * as costModel from "../../models/cost.model.js";
import * as groupService from "./group.service.js";


export interface Routes {
    prevToCurr: costModel.Cost;
    currToNext: costModel.Cost | null;
    currToDest: costModel.Cost;
    isDestination: boolean;
}

// interface ApplyInsertionInput {
//     group: groupService.Group;
//     plan: groupService.InsertionPlan;
//     // routes: Routes;
// };


export const applyInsertion = (
    group: groupService.Group,
    plan: groupService.InsertionPlan,
): groupService.Group => {

    // clone to avoid mutation
    const updatedGroup: groupService.Group = structuredClone(group);

    const previous = updatedGroup.members.find(
        member => member.userId === plan.previousUserId
    );
    if (!previous) throw new Error("Previous member not found");

    // build new member
    const newMember: groupService.GroupMember = {
        userId: plan.insertionCandidate.userId,
        name: plan.insertionCandidate.name,
        location: plan.insertionCandidate.location,
        toNext: plan.routes.isDestination ? null : plan.routes.currToNext,
        toDestination: plan.routes.currToDest,
    };

    // update link from previous to candidate
    previous.toNext = plan.routes.prevToCurr;

    // add member
    updatedGroup.members.push(newMember);

    const newMemberIndex: number
        = plan.routeOrder.findIndex(id => id === newMember.userId)

    // update route
    updatedGroup.route.splice(newMemberIndex, 0, {
        userId: newMember.userId,
        name: newMember.name,
        time: 0,
        address: newMember.location.address
    });

    var workingTime: number = group.timeOfArrival;
    for (var i = updatedGroup.route.length - 1; i >= 0; --i) {
        const routeMember = updatedGroup.route[i];
        if (!routeMember) throw new Error("Could not find route-member while inserting plan into group.");

        const member: groupService.GroupMember | undefined
            = updatedGroup.members.find(member => member.userId === routeMember.userId);
        if (!member) throw new Error("Could not find member while inserting plan into group.");

        console.log(routeMember.userId, workingTime);
        if (member.toNext) {
            workingTime -= member.toNext.travelTimeSeconds ?? 0;
        } else {
            workingTime -= member.toDestination.travelTimeSeconds ?? 0;
        }
        console.log(routeMember.userId, workingTime);

        routeMember.time = workingTime;
    }


    // update totals
    updatedGroup.totalTravelTimeSeconds = plan.newTotalTravelTime;
    updatedGroup.totalDetourTimeSeconds = plan.totalDetour;

    // recompute averages
    // let totalTravel: number = 0;
    // let totalEuclid: number = 0;

    // for (const member of updatedGroup.members) {
    //     const link: costModel.Cost = member.toNext ?? member.toDestination;
    //     if (!link) continue;
    //
    //     totalTravel += link.travelDistanceMeters ?? 0;
    //     totalEuclid += link.distanceEuclidean ?? 0;
    // }
    //
    // updatedGroup.secsPerMeterAverage =
    //     updatedGroup.totalTravelTimeSeconds / totalTravel;
    //
    // updatedGroup.metersPerEuclideanDistAverage =
    //     totalTravel / totalEuclid;

    updatedGroup.mapsLink = groupService.makeGroupMapsLink(updatedGroup);

    return updatedGroup;
}
