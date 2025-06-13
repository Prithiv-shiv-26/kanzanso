package net.kanzanso.Kanzanso.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "questions")
public class Question {

    @Id
    private String id;
    private String text;
    private List<String> options;
    private List<Integer> scores;
    private String category;
    private String quizType;

    /**
     * Create a new Question with the given parameters
     * @param text Question text
     * @param options List of options
     * @param scores List of scores
     * @param category Question category
     * @param quizType Quiz type
     * @return New Question instance
     */
    public static Question create(String text, List<String> options, List<Integer> scores, String category, String quizType) {
        Question q = new Question();
        q.setText(text);
        q.setOptions(options);
        q.setScores(scores);
        q.setCategory(category);
        q.setQuizType(quizType);
        return q;
    }
}