FEATURE_COLUMNS = [
    "duration",
    "avg_page_time",
    "scroll_completion",
    "tab_switch_rate",
    "page_revisit_rate",
    "attention_ratio",
]


def build_feature_matrix(df):

    return df[FEATURE_COLUMNS]
