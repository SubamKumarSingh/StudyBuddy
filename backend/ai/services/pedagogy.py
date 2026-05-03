# from resources.models import PDFResource

# from .learner_diagnosis import diagnose_learner
# from .content_diagnosis import diagnose_content
# from .strategy_engine import score_strategies


# def pedagogical_engine(user):
#     learner = diagnose_learner(user)

#     pdfs = PDFResource.objects.filter(user=user)

#     if not pdfs.exists():
#         return {
#             "type": "system",
#             "action": "add_materials",
#             "message": "Add study materials to begin learning.",
#             "reason": "No resources available."
#         }

#     candidates = []

#     for pdf in pdfs:

#         content = diagnose_content(pdf)

#         # ---------- PEDAGOGICAL URGENCY ----------
#         urgency = (
#             content["importance_degree"] * 0.5 +
#             content["neglect_degree"] * 0.3 +
#             content["difficulty_degree"] * 0.2
#         )

#         candidates.append({
#             "pdf": pdf,
#             "urgency": urgency,
#             "content": content,
#         })

#     # ---------- CHOOSE BEST CONTENT ----------
#     candidates.sort(key=lambda x: x["urgency"], reverse=True)

#     chosen = candidates[0]
#     pdf = chosen["pdf"]
#     content = chosen["content"]

#     # ---------- CHOOSE STRATEGY ----------
#     scores = score_strategies(learner, content)
#     best_strategy = max(scores, key=scores.get)

#     return {
#         "type": "learning_decision",

#         "pdf_id": pdf.id,
#         "pdf_title": pdf.display_title(),

#         "strategy": best_strategy,
#         "strategy_scores": scores,

#         "learner_state": learner,
#         "content_state": content,

#         "urgency": round(chosen["urgency"], 3),

#         "message": build_message(best_strategy, pdf),

#         "explanation": build_explanation(
#             learner,
#             content,
#             best_strategy
#         ),
#     }


# def build_message(strategy, pdf):

#     messages = {
#         "explore":
#             f"Explore {pdf.display_title()} to build familiarity.",

#         "review_light":
#             f"Lightly review {pdf.display_title()} without pressure.",

#         "guided_revision":
#             f"Reinforce key ideas in {pdf.display_title()}.",

#         "deep_study":
#             f"Deeply study {pdf.display_title()} — you're ready.",

#         "revise_priority":
#             f"Revise {pdf.display_title()} — it needs attention.",
#     }

#     return messages.get(strategy, "Continue learning.")


# def build_explanation(learner, content, strategy):

#     return {
#         "learner_focus": learner["focus_level"],
#         "fatigue": learner["fatigue"],
#         "difficulty": content["difficulty"],
#         "importance": content["importance"],
#         "neglect": content["neglect"],
#         "strategy": strategy,
#     }

from resources.models import PDFResource

from .learner_diagnosis import diagnose_learner
from .content_diagnosis import diagnose_content
from .strategy_engine import score_strategies
from .readiness import assess_readiness


def pedagogical_engine(user):

    learner = diagnose_learner(user)

    readiness = assess_readiness(learner)

    pdfs = PDFResource.objects.filter(user=user)

    if not pdfs.exists():
        return {
            "type": "system",
            "action": "add_materials",
            "message": "Add study materials to begin learning.",
        }

    candidates = []

    for pdf in pdfs:

        content = diagnose_content(pdf)

        urgency = (
            content["importance_degree"] * 0.5 +
            content["neglect_degree"] * 0.3 +
            content["difficulty_degree"] * 0.2
        )

        candidates.append({

            "pdf": pdf,

            "content": content,

            "urgency": urgency

        })

    candidates.sort(key=lambda x: x["urgency"], reverse=True)

    chosen = candidates[0]

    scores = score_strategies(learner, chosen["content"])

    best_strategy = max(scores, key=scores.get)

    return {

        "pdf_id": chosen["pdf"].id,

        "pdf_title": chosen["pdf"].display_title(),

        "strategy": best_strategy,

        "readiness": readiness,

        "urgency": round(chosen["urgency"], 3),

        "learner_state": learner,

        "content_state": chosen["content"],

        "strategy_scores": scores,

    }