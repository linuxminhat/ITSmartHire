def concatenate_tokens(token_list):
    """
    Xử lí nối chuỗi Token

    Concatenate tokens based on NER tags to form meaningful entities.

    Args:
        token_list: List of dictionaries with keys: 'token', 'tag', 'position'

    Returns:
        List of tuples: (entity_text, entity_tag, start_position, end_position)
    """
    entities = []
    current_tokens = []
    current_tag = None
    start_position = None

    for i, item in enumerate(token_list):
        token = item["token"]
        tag = item["tag"]
        position = item["position"]

        if tag in ["[CLS]", "[SEP]"]:
            continue

        if tag.startswith("B-"):

            if current_tokens:
                entities.append(
                    (
                        "".join(current_tokens).replace("##", ""),
                        current_tag,
                        start_position,
                        token_list[i - 1]["position"],
                    )
                )
                current_tokens = []

            current_tokens.append(token)
            current_tag = tag[2:]
            start_position = position

            for j in range(i + 1, len(token_list)):
                next_item = token_list[j]
                next_tag = next_item["tag"]

                if next_tag == f"I-{current_tag}" or next_tag == "X":
                    current_tokens.append(next_item["token"])
                elif next_tag == f"L-{current_tag}":
                    current_tokens.append(next_item["token"])

                    k = j + 1
                    while k < len(token_list) and token_list[k]["tag"] == "X":
                        current_tokens.append(token_list[k]["token"])
                        k += 1

                    # Save the entity
                    entities.append(
                        (
                            "".join(current_tokens).replace("##", ""),
                            current_tag,
                            start_position,
                            (
                                token_list[k - 1]["position"]
                                if k > j + 1
                                else next_item["position"]
                            ),
                        )
                    )
                    current_tokens = []
                    current_tag = None
                    i = k - 1
                    break
                else:

                    break

        elif tag.startswith("U-"):
            current_tokens = [token]
            current_tag = tag[2:]
            start_position = position

            j = i + 1
            while j < len(token_list) and token_list[j]["tag"] == "X":
                current_tokens.append(token_list[j]["token"])
                j += 1

            entities.append(
                (
                    "".join(current_tokens).replace("##", ""),
                    current_tag,
                    start_position,
                    token_list[j - 1]["position"] if j > i + 1 else position,
                )
            )
            current_tokens = []
            current_tag = None
            i = j - 1

        elif tag != "X" and tag != "O":
            if current_tokens:
                entities.append(
                    (
                        "".join(current_tokens).replace("##", ""),
                        current_tag,
                        start_position,
                        token_list[i - 1]["position"],
                    )
                )
                current_tokens = []
                current_tag = None

    if current_tokens:
        entities.append(
            (
                "".join(current_tokens).replace("##", ""),
                current_tag,
                start_position,
                token_list[-1]["position"],
            )
        )

    return entities
