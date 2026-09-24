const proposalService = require("../services/proposal.js");
const asyncHandler = require("../utils/asyncHandler");

const createProposal = asyncHandler(
  async (req, res) => {
    const proposal =
      await proposalService.createProposal(
        req.params.jobId,
        req.user._id,
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Proposal submitted successfully",
      data: {
        proposal
      }
    });
  }
);

const getJobProposals = asyncHandler(
  async (req, res) => {
    const proposals =
      await proposalService.getJobProposals(
        req.params.jobId,
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: {
        proposals
      }
    });
  }
);

const getMyProposals = asyncHandler(
  async (req, res) => {
    const proposals =
      await proposalService.getMyProposals(
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: {
        proposals
      }
    });
  }
);

const getProposalById = asyncHandler(
  async (req, res) => {
    const proposal =
      await proposalService.getProposalById(
        req.params.id,
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: {
        proposal
      }
    });
  }
);


/*

ACCEPT PROPOSAL

*/
const acceptProposal = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { proposalId } = req.params;

    const clientId = req.user._id;

    await session.withTransaction(async () => {
      const proposal = await Proposal.findById(
        proposalId
      )
        .populate("job")
        .populate("freelancer")
        .session(session);

      if (!proposal) {
        throw new Error("Proposal not found");
      }

      if (
        proposal.job.client.toString() !==
        clientId.toString()
      ) {
        throw new Error(
          "You are not allowed to accept this proposal"
        );
      }

      if (proposal.status !== "PENDING") {
        throw new Error(
          "This proposal is no longer available"
        );
      }

      /*
       * Prevent duplicate project creation
       */

      const existingProject =
        await Project.findOne({
          proposal: proposal._id,
        }).session(session);

      if (existingProject) {
        throw new Error(
          "A project already exists for this proposal"
        );
      }

      /*
       * Create project
       */

      const project = await Project.create(
        [
          {
            title: proposal.job.title,

            description:
              proposal.job.description,

            client: clientId,

            freelancer:
              proposal.freelancer._id,

            job: proposal.job._id,

            proposal: proposal._id,

            budget: proposal.bidAmount,

            status: "AWAITING_PAYMENT",

            funded: false,
          },
        ],
        { session }
      );

      const createdProject = project[0];

      /*
       * Create milestones.
       *
       * If your proposal already has milestone
       * information, use that instead.
       */

      await Milestone.create(
        [
          {
            project: createdProject._id,

            title: "Project Milestone",

            description:
              "Complete the agreed project work.",

            amount: proposal.bidAmount,

            order: 1,

            status: "PENDING",
          },
        ],
        { session }
      );

      /*
       * Update proposal
       */

      proposal.status = "ACCEPTED";

      await proposal.save({ session });

      /*
       * Update job
       */

      await Job.findByIdAndUpdate(
        proposal.job._id,
        {
          $set: {
            status: "IN_PROGRESS",
          },
        },
        { session }
      );

      /*
       * Generate unique payment reference
       */

      const reference =
        `project-${createdProject._id}-${crypto
          .randomBytes(8)
          .toString("hex")}`.toLowerCase();

      /*
       * Create payment record
       */

      await Payment.create(
        [
          {
            reference,

            client: clientId,

            freelancer:
              proposal.freelancer._id,

            project: createdProject._id,

            amount: proposal.bidAmount,

            currency: "NGN",

            provider: "PAYSTACK",

            status: "PENDING",
          },
        ],
        { session }
      );

      /*
       * Save payment reference on project
       */

      createdProject.paymentReference =
        reference;

      await createdProject.save({ session });
    });

    res.status(201).json({
      success: true,
      message:
        "Proposal accepted. Project created and awaiting payment.",
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};


/*

REJECT PROPOSAL

*/

const rejectProposal = asyncHandler(
  async (req, res) => {
    const proposal =
      await proposalService.rejectProposal(
        req.params.id,
        req.user._id
      );

    res.status(200).json({
      success: true,
      message: "Proposal rejected successfully",
      data: {
        proposal
      }
    });
  }
);


module.exports = {
  createProposal,
  getJobProposals,
  getMyProposals,
  getProposalById,
  acceptProposal,
  rejectProposal
};