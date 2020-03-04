library(dplyr)
library(stringr)
library(tidyr)

# setwd("Desktop/INFO474/INFO474-FinalProject/")

# all_data <- read.csv("data/h1b_kaggle.csv", stringsAsFactors = FALSE)

# CASE_STATUS, JOB_TITLE, YEAR
filtered_data <- all_data %>%
  select(EMPLOYER_NAME, WORKSITE, lon, lat, YEAR, CASE_STATUS)

transformData <- function(filtered_data, year) {
  data_year <- filtered_data %>%
    filter(YEAR == year) %>%
    filter(CASE_STATUS == "CERTIFIED")

  data_year$STATE <- str_split_fixed(data_year$WORKSITE, ", ", 2)
  data_year$STATE <- data_year$STATE[,2]

  data_year <- data_year %>%
    select(EMPLOYER_NAME, STATE, lon, lat) %>%
    filter(!is.na(lon) | !is.na(lat)) %>%
    filter(!is.na(STATE))

  summarized_year <- data_year %>%
    group_by(EMPLOYER_NAME,STATE) %>%
    summarize(longitude = mean(lon, na.rm = TRUE),
              latitude = mean(lat, na.rm = TRUE),
              count = n())

  write.csv(summarized_year, paste0("geographic-mengjiao/data/", year, ".csv"))

  summarized_state_year <- data_year %>%
    group_by(STATE) %>%
    summarize(year = n())

  summarized_state_year
}

summarized_state_2016 <- transformData(filtered_data, 2016)
summarized_state_2015 <- transformData(filtered_data, 2015)
summarized_state_2014 <- transformData(filtered_data, 2014)
summarized_state_2013 <- transformData(filtered_data, 2013)
summarized_state_2012 <- transformData(filtered_data, 2012)
summarized_state_2011 <- transformData(filtered_data, 2011)


summarized_data <- summarized_state_2011 %>% 
  left_join(summarized_state_2012, 
            by="STATE", 
            suffix = c("2011", "2012")
            ) %>%
  left_join(summarized_state_2013, 
            by="STATE"
            ) %>%
  left_join(summarized_state_2014, 
            by="STATE", 
            suffix = c("2013", "2014")
            ) %>%
  left_join(summarized_state_2015, 
            by="STATE"
            ) %>%
  left_join(summarized_state_2016, 
            by="STATE", 
            suffix = c("2015", "2016")
            )

write.csv(summarized_data, "geographic-mengjiao/data/state.csv")

# 
# yearly_data <- all_data %>%
#   select(EMPLOYER_NAME, YEAR, CASE_STATUS) %>%
#   group_by(EMPLOYER_NAME, YEAR) %>%
#   filter(CASE_STATUS == "CERTIFIED") %>%
#   summarize(count = n())

# data_2011 <- filtered_data %>%
#   filter(YEAR == 2011)
# 
# data_2012 <- filtered_data %>%
#   filter(YEAR == 2012)
# 
# data_2013 <- filtered_data %>%
#   filter(YEAR == 2013)
# 
# data_2014 <- filtered_data %>%
#   filter(YEAR == 2014)
# 
# data_2015 <- filtered_data %>%
#   filter(YEAR == 2015)

# write.csv(data_2011, "geographic-mengjiao/data/2011.csv")
# write.csv(data_2012, "geographic-mengjiao/data/2012.csv")
# write.csv(data_2013, "geographic-mengjiao/data/2013.csv")
# write.csv(data_2014, "geographic-mengjiao/data/2014.csv")
# write.csv(data_2015, "geographic-mengjiao/data/2015.csv")
