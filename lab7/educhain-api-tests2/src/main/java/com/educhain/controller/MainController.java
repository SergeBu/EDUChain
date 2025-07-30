package com.educhain.controller;  // Должен быть в том же пакете, что и другие контроллеры

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller  // Важно использовать @Controller вместо @RestController для возврата имен шаблонов
public class MainController {

    @GetMapping("/")  // Обрабатывает GET-запросы к корневому URL
    public String home() {
        return "home";  // Возвращает имя шаблона (без расширения .html)
    }
}