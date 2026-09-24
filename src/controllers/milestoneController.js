const milestoneService = require("../services/milestone.js");
const asyncHandler = require("../utils/asyncHandler");


const createMilestone = asyncHandler(
  async (req, res) => {
    const milestone =
      await milestoneService.createMilestone(
        req.params.projectId,
        req.user._id,
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Milestone created successfully",
      data: {
        milestone
      }
    });
  }
);


const getProjectMilestones =
  asyncHandler(async (req, res) => {
    const milestones =
      await milestoneService.getProjectMilestones(
        req.params.projectId,
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: {
        milestones
      }
    });
  });


const getMilestoneById =
  asyncHandler(async (req, res) => {
    const milestone =
      await milestoneService.getMilestoneById(
        req.params.id,
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: {
        milestone
      }
    });
  });


const updateMilestone =
  asyncHandler(async (req, res) => {
    const milestone =
      await milestoneService.updateMilestone(
        req.params.id,
        req.user._id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Milestone updated successfully",
      data: {
        milestone
      }
    });
  });


const deleteMilestone =
  asyncHandler(async (req, res) => {
    await milestoneService.deleteMilestone(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Milestone deleted successfully"
    });
  });


const startMilestone =
  asyncHandler(async (req, res) => {
    const milestone =
      await milestoneService.startMilestone(
        req.params.id,
        req.user._id
      );

    res.status(200).json({
      success: true,
      message: "Milestone started successfully",
      data: {
        milestone
      }
    });
  });


const submitMilestone =
  asyncHandler(
    async (req, res) => {
      const { id } = req.params;
      const { submissionNote } =
        req.body;

      const milestone =
        await Milestone.findById(id);

      if (!milestone) {
        throw new AppError(
          "Milestone not found",
          404
        );
      }

      if (
        milestone.freelancer.toString() !==
        req.user._id.toString()
      ) {
        throw new AppError(
          "You are not authorized to submit this milestone",
          403
        );
      }

      if (
        !["FUNDED", "IN_PROGRESS"].includes(
          milestone.status
        )
      ) {
        throw new AppError(
          "This milestone cannot be submitted",
          400
        );
      }

      milestone.status = "SUBMITTED";
      milestone.submissionNote =
        submissionNote || "";
      milestone.submittedAt = new Date();

      await milestone.save();

      res.status(200).json({
        success: true,
        message:
          "Milestone submitted successfully",
        data: {
          milestone
        }
      });
    }
  );


const approveMilestone =
  asyncHandler(
    async (req, res) => {
      const { id } = req.params;

      const milestone =
        await Milestone.findById(id);

      if (!milestone) {
        throw new AppError(
          "Milestone not found",
          404
        );
      }

      if (
        milestone.client.toString() !==
        req.user._id.toString()
      ) {
        throw new AppError(
          "You are not authorized to approve this milestone",
          403
        );
      }

      if (
        milestone.status !== "SUBMITTED"
      ) {
        throw new AppError(
          "Only submitted milestones can be approved",
          400
        );
      }

      milestone.status = "APPROVED";
      milestone.approvedAt = new Date();

      await milestone.save();

      res.status(200).json({
        success: true,
        message:
          "Milestone approved successfully",
        data: {
          milestone
        }
      });
    }
  );


const rejectMilestone =
  asyncHandler(async (req, res) => {
    const milestone =
      await milestoneService.rejectMilestone(
        req.params.id,
        req.user._id
      );

    res.status(200).json({
      success: true,
      message: "Milestone rejected successfully",
      data: {
        milestone
      }
    });
  });


module.exports = {
  createMilestone,
  getProjectMilestones,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
  startMilestone,
  submitMilestone,
  approveMilestone,
  rejectMilestone
};