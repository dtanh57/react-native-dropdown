import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ScrollView,
  Text,
  ViewPropTypes,
  Image,
} from "react-native";
import PropTypes from "prop-types";

const Dropdown = forwardRef((props, ref) => {
  const {
    style,
    buttonStyle,
    textStyle,
    dropdownStyle,
    cellStyle,
    buttonTextStyle,
    data,
    defaultValue,
    onChangeValue,
    showIcon,
    renderItem,
    renderIcon,
    renderIconWithAnim,
  } = props;

  const [isShowed, setIsShowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(defaultValue || "");

  const spinValue = useRef(new Animated.Value(0));
  const button = useRef(null);
  const positionTop = useRef(null);
  const positionRight = useRef(null);
  const btnWidth = useRef(null);
  const dropdownRef = useRef();

  const show = () => {
    updatePosition(() => {
      setIsShowed(true);
      Animated.timing(spinValue.current, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => spinValue.current.setValue(1));
    });
  };
  const hide = () => {
    setIsShowed(false);
    Animated.timing(spinValue.current, {
      toValue: 2,
      duration: 300,
      useNativeDriver: true,
    }).start(() => spinValue.current.setValue(0));
  };
  const updatePosition = (cb) => {
    if (button.current && button.current.measure) {
      button.current.measure((fx, fy, width, height, px, py) => {
        positionTop.current = py + height;
        positionRight.current = px;
        btnWidth.current = width;
        cb && cb();
      });
    }
  };
  const onPressItem = (item, index) => () => {
    setValue(item);
    onChangeValue && onChangeValue(item, index);
    hide();
  };
  useImperativeHandle(ref, () => ({
    hide,
  }));

  const renderLoading = () => {
    return <ActivityIndicator size="small" />;
  };
  const renderIcons = () => {
    if (renderIcon) {
      return renderIcon();
    }
    const spin = spinValue.current.interpolate({
      inputRange: [0, 1, 2],
      outputRange: ["0deg", "180deg", "360deg"],
    });
    return (
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        {renderIconWithAnim ? (
          renderIconWithAnim()
        ) : (
          <Image
            source={require("./arrow.png")}
            style={{ width: 20, height: 20 }}
            resizeMode="contain"
          />
        )}
      </Animated.View>
    );
  };
  const renderDropdown = () => {
    if (renderItem) {
      return (
        <View
          style={{
            backgroundColor: "white",
            position: "relative",
            top: positionTop.current,
            right: 0,
            ...dropdownStyle,
          }}
        >
          {renderItem()}
        </View>
      );
    }
    let height = 0;
    let dataRender = defaultValue
      ? [defaultValue, ...(data || [])]
      : [...(data || [])];
    if (Array.isArray(data) && defaultValue) {
      height = data.length < 6 ? 49 * (data.length + 1) : 360;
    } else if (!defaultValue && Array.isArray(data)) {
      height = data.length < 6 ? 49 * data.length : 360;
    }
    return (
      <View
        style={{
          width: btnWidth.current,
          height,
          backgroundColor: "white",
          borderWidth: StyleSheet.hairlineWidth,
          borderTopWidth: 0,
          position: "relative",
          top: positionTop.current,
          right: -positionRight.current,
          ...dropdownStyle,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {dataRender.map((item, index) => {
            return (
              <TouchableOpacity
                style={{
                  borderBottomWidth: 0.6,
                  borderBottomColor: "grey",
                  paddingVertical: 14,
                  paddingHorizontal: 8,
                  ...cellStyle,
                }}
                key={"" + index}
                onPress={onPressItem(item, index)}
              >
                <Text style={{ fontSize: 18, ...textStyle }}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };
  const renderButton = () => {
    return (
      <TouchableOpacity
        ref={button}
        style={{
          alignSelf: "flex-end",
          flexDirection: "row",
          backgroundColor: "white",
          borderWidth: 0.7,
          borderColor: "black",
          marginVertical: 6,
          paddingVertical: 12,
          paddingHorizontal: 8,
          alignItems: "center",
          justifyContent: "space-between",
          ...buttonStyle,
        }}
        onPress={show}
      >
        <Text
          style={{
            color: "black",
            fontSize: 18,
            ...buttonTextStyle,
          }}
        >
          {value || (Array.isArray(data) ? data[0] : "")}
        </Text>
        {showIcon && renderIcons()}
      </TouchableOpacity>
    );
  };
  const renderModal = () => {
    if (isShowed) {
      return (
        <Modal
          animationType={"fade"}
          visible={true}
          transparent={true}
          onRequestClose={hide}
        >
          <TouchableWithoutFeedback disabled={!isShowed} onPress={hide}>
            <View style={styles.modal}>
              {loading ? renderLoading() : renderDropdown()}
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      );
    }
  };

  return (
    <View ref={dropdownRef} style={{ ...style }}>
      {renderButton()}
      {renderModal()}
    </View>
  );
});

Dropdown.propTypes = {
  style: ViewPropTypes.style,
  buttonStyle: ViewPropTypes.style,
  textStyle: ViewPropTypes.style,
  dropdownStyle: ViewPropTypes.style,
  buttonTextStyle: ViewPropTypes.style,
  cellStyle: ViewPropTypes.style,
  data: PropTypes.array,
  defaultValue: PropTypes.string,
  onChangeValue: PropTypes.func,
  showIcon: PropTypes.bool,
  renderIcon: PropTypes.func,
  renderIconWithAnim: PropTypes.func,
  renderItem: PropTypes.func,
};

const styles = StyleSheet.create({
  modal: {
    flexGrow: 1,
  },
  dropdown: {
    position: "absolute",
    height: (33 + StyleSheet.hairlineWidth) * 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "lightgray",
    borderRadius: 2,
    backgroundColor: "white",
    justifyContent: "center",
  },
  loading: {
    alignSelf: "center",
  },
  list: {
    flexGrow: 1,
  },
  rowText: {
    paddingHorizontal: 6,
    paddingVertical: 10,
    fontSize: 11,
    color: "gray",
    backgroundColor: "white",
    textAlignVertical: "center",
  },
  highlightedRowText: {
    color: "black",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "lightgray",
  },
});

export { Dropdown };
